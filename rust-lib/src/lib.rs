#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use futures_util::StreamExt;
use napi::bindgen_prelude::*;
use napi::threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode};
use napi::{Error, Result, Status};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use lazy_static::lazy_static;

#[derive(Deserialize, Serialize)]
#[napi(object)]
pub struct ProxyRequestPayload {
    pub path: String,
    pub body: String, // Changed from serde_json::Value
    pub authorization: Option<String>,
}

fn validate_and_sanitize_path(path: &str) -> std::result::Result<String, String> {
    if path.contains("://")
        || path.contains("..")
        || path.contains('\0')
        || path.trim().to_lowercase().starts_with("http")
    {
        return Err(format!(
            "Invalid path '{}': contains malicious patterns.",
            path
        ));
    }

    let sanitized_path = path.trim_start_matches('/').to_string();

    let allowlist: HashSet<&str> = ["v1/chat/completions"].iter().cloned().collect();

    if !allowlist.contains(sanitized_path.as_str()) {
        return Err(format!(
            "Invalid path '{}': not in allowlist.",
            sanitized_path
        ));
    }

    Ok(sanitized_path)
}

#[napi]
pub async fn proxy_request_blocking(
    payload: ProxyRequestPayload,
) -> Result<String> { // Changed to return String
    let sanitized_path =
        validate_and_sanitize_path(&payload.path).map_err(|e| Error::new(Status::InvalidArg, e))?;
    let client = reqwest::Client::new();
    let url = format!("http://127.0.0.1:5000/{}", sanitized_path);

    let mut request_builder = client.post(&url);
    if let Some(auth) = payload.authorization {
        request_builder = request_builder.header("Authorization", format!("Bearer {}", auth));
    }

    let res = request_builder
        .body(payload.body) // Use body() instead of json()
        .send()
        .await
        .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

    if res.status().is_success() {
        res.text()
            .await
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
    } else {
        let status = res.status();
        let text = res
            .text()
            .await
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
        Err(Error::new(
            Status::GenericFailure,
            format!(
                "API request to {} failed with status {}: {}",
                url, status, text
            ),
        ))
    }
}

#[napi]
pub async fn proxy_request_streaming(
    payload: ProxyRequestPayload,
    #[napi(ts_arg_type = "(chunk: string) => void")] on_chunk: ThreadsafeFunction<String>,
    #[napi(ts_arg_type = "() => void")] on_end: ThreadsafeFunction<()>,
    #[napi(ts_arg_type = "(error: string) => void")] on_error: ThreadsafeFunction<String>,
) -> Result<()> {
    let sanitized_path =
        validate_and_sanitize_path(&payload.path).map_err(|e| Error::new(Status::InvalidArg, e))?;
    let client = reqwest::Client::new();
    let url = format!("http://127.0.0.1:5000/{}", sanitized_path);

    let mut request_builder = client.post(&url);
    if let Some(auth) = payload.authorization {
        request_builder = request_builder.header("Authorization", format!("Bearer {}", auth));
    }

    let res = request_builder
        .body(payload.body) // Use body() instead of json()
        .send()
        .await
        .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

    if !res.status().is_success() {
        let status = res.status();
        let text = res
            .text()
            .await
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
        let err_msg = format!(
            "API request to {} failed with status {}: {}",
            url, status, text
        );
        on_error.call(Ok(err_msg), ThreadsafeFunctionCallMode::Blocking);
        return Err(Error::new(Status::GenericFailure, "Request failed"));
    }

    let body = res.text().await.map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
    on_chunk.call(Ok(body), ThreadsafeFunctionCallMode::Blocking);
    on_end.call(Ok(()), ThreadsafeFunctionCallMode::Blocking);


    Ok(())
}

struct SidecarManager {
    child_process: Option<Child>,
}

lazy_static! {
    static ref SIDECAR_MANAGER: Mutex<SidecarManager> =
        Mutex::new(SidecarManager { child_process: None });
}

#[derive(Deserialize)]
#[napi(object)]
pub struct StartSidecarPayload {
    pub path: String,
}

#[napi]
pub fn start_sidecar(
    payload: StartSidecarPayload,
    #[napi(ts_arg_type = "(output: string) => void")] on_output: ThreadsafeFunction<String>,
) -> Result<()> {
    let mut manager = SIDECAR_MANAGER.lock().unwrap();

    if manager.child_process.is_some() {
        return Err(Error::new(
            Status::GenericFailure,
            "Sidecar process is already running.",
        ));
    }

    let mut command = Command::new(&payload.path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;

    let stdout = command.stdout.take().expect("Failed to open stdout");
    let stderr = command.stderr.take().expect("Failed to open stderr");

    manager.child_process = Some(command);

    let on_stdout = on_output.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                on_stdout.call(Ok(line), ThreadsafeFunctionCallMode::Blocking);
            }
        }
    });

    thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                on_output.call(Ok(line), ThreadsafeFunctionCallMode::Blocking);
            }
        }
    });

    Ok(())
}

#[napi]
pub fn stop_sidecar() -> Result<()> {
    let mut manager = SIDECAR_MANAGER.lock().unwrap();

    if let Some(mut child) = manager.child_process.take() {
        child
            .kill()
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
        child
            .wait()
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
    }

    Ok(())
}
