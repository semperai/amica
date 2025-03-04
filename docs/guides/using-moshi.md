---
title: Using Moshi (Voice to Voice)
order: 3
---


To test Moshi, you need to set up and run the Moshi Server on Runpod (Or your running it on your own computer/server):

---

### **Step 1: Set Up Moshi Server**
1. Login to the Terminal on your instance, whether it is your own server or a Runpod instance (If you don't have a good GPU)
1. **Clone the Moshi Server**  
   ```bash
   git clone https://github.com/flukexp/moshi_server.git moshi && cd moshi
   ```  

2. **Create a virtual environment**  
   ```bash
   python -m venv venv
   ```  

3. **Activate the virtual environment**  
   - On macOS/Linux:  
     ```bash
     source venv/bin/activate
     ```  
   - On Windows (Command Prompt):  
     ```bash
     venv\Scripts\activate
     ```  
   - On Windows (PowerShell):  
     ```powershell
     .\venv\Scripts\Activate
     ```  

4. **Install dependencies**
  ```bash
  pip install -r requirements.txt
  ```

---

### **Step 2: Start the Moshi Server**  

Start the Moshi server (For Runpod):  
```bash
uvicorn moshi_service:app --host 0.0.0.0 --port 8000 
```  
Start the Moshi server (For your own computer):  
```bash
uvicorn moshi_service:app --host 127.0.0.1 --port 8000 
```  

---

### **Step 3: Change Settings on Amica to Use Moshi**  

Open Settings > Chatbot Backend , and select Moshi.

Then go to Settings > Chatbot Backend > Moshi, and then insert the correct URL for accessing Moshi server. (E.g. http://localhost:8000 for local server and a runpod proxy URL, which is on your runpod instance and looks like : https://rn8xojhvb-8000.proxy.runpod.net, the URL has the runpod instance identifier and the port)

*There is no difference whether you are running locally or off the Amica demo.*


---

#### **Notes:**  
- Ensure that **Python and pip** are installed before proceeding. **Edit the model URLs in the main python script if you want to use a different model from Kyutai.** 
---

Replace the `{port-number}` in the URL with the actual port number.

---
