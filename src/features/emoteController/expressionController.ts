import * as THREE from "three";
import {
  VRM,
  VRMExpressionManager,
  VRMExpressionPresetName,
} from "@pixiv/three-vrm";
import { AutoLookAt } from "./autoLookAt";
import { AutoBlink } from "./autoBlink";
import { emotionNames } from "@/features/chat/messages";

/**
 * Expressionを管理するクラス
 *
 * 主に前の表情を保持しておいて次の表情を適用する際に0に戻す作業や、
 * 前の表情が終わるまで待ってから表情適用する役割を持っている。
 */
export class ExpressionController {
  private _autoLookAt: AutoLookAt;
  private _autoBlink?: AutoBlink;
  private _expressionManager?: VRMExpressionManager;
  private _currentEmotion: VRMExpressionPresetName | string;
  private _currentLipSync: {
    preset: VRMExpressionPresetName | string;
    value: number;
  } | null;
  constructor(vrm: VRM, camera: THREE.Object3D) {
    this._autoLookAt = new AutoLookAt(vrm, camera);
    this._currentEmotion = "neutral";
    this._currentLipSync = null;
    this.registerExpression(vrm)
    if (vrm.expressionManager) {
      this._expressionManager = vrm.expressionManager;
      this._autoBlink = new AutoBlink(vrm.expressionManager);
    }
  }

  public registerExpression(vrm: VRM) {
    const expressionManager = vrm.expressionManager;
    if (!expressionManager) return;
  
    const { expressionMap: allExpressions, presetExpressionMap: presetExpressions } = expressionManager;
    const oddExpressions = Object.keys(allExpressions).filter(key => !(key in presetExpressions));
  
    oddExpressions.forEach(expressionName => {
      const expression = allExpressions[expressionName];
      if (expression) expressionManager.registerExpression(expression);
    });

    const allExpressionNames = Object.keys(allExpressions);
    emotionNames.push(...allExpressionNames);

    return allExpressionNames;
  }

  public playEmotion(preset: VRMExpressionPresetName | string) {
    const normalizedPreset = `${preset.charAt(0).toUpperCase()}${preset.slice(1)}`;
    
    if (this._currentEmotion == preset) {
      return;
    }

    if (this._currentEmotion != "neutral") {
      this._expressionManager?.setValue(this._currentEmotion, 0);
    }

    if (preset == "neutral") {
      this._autoBlink?.setEnable(true);
      this._currentEmotion = preset;
      return;
    }

    const value = (normalizedPreset in VRMExpressionPresetName) ? (normalizedPreset === "Surprised" ? 0.5 : 1) : 0.5;

    const t = this._autoBlink?.setEnable(false) || 0;
    this._currentEmotion = preset;
    setTimeout(() => {
      this._expressionManager?.setValue(preset, value);
    }, t * 1000);
  }

  public lipSync(preset: VRMExpressionPresetName | string, value: number) {
    if (this._currentLipSync) {
      this._expressionManager?.setValue(this._currentLipSync.preset, 0);
    }
    this._currentLipSync = {
      preset,
      value,
    };
  }

  public update(delta: number) {
    if (this._autoBlink) {
      this._autoBlink.update(delta);
    }

    if (this._currentLipSync) {
      const weight =
        this._currentEmotion === "neutral"
          ? this._currentLipSync.value * 0.5
          : this._currentLipSync.value * 0.25;
      this._expressionManager?.setValue(this._currentLipSync.preset, weight);
    }
  }
}