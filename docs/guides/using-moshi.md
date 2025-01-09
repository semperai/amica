---
title: Using Moshi (Voice to Voice)
order: 3
---


To test Moshi, you need to set up and run **two servers** on Runpod (Or your running it on your own computer): **Amica** and **Moshi**. Follow these steps to get started:

---

### **Step 1: Set Up Working Environment**
1. Once you’ve logged into your Runpod instance, navigate to the working directory:
   ```bash
   cd /home
   ```
2. You will see two folders: `/amica` and `/moshi`.

---

### **Step 2: Open Two Terminals**
You will need two bash terminals to run the servers simultaneously:
- **Terminal 1**: To run the Amica server.
- **Terminal 2**: To run the Moshi server.

---

### **Step 3: Run Amica Server**
1. In **Terminal 1**, navigate to the **Amica** directory:
   ```bash
   cd /home/amica
   ```
2. Install `npm` using the following commands:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
   nvm install node
   ```
3. Install dependencies and start the server:
   ```bash
   npm install .
   npm run dev
   ```
4. The Amica server will start on **port 3000**.

---

### **Step 4: Run Moshi Server**
1. In **Terminal 2**, navigate to the **Moshi** directory:
   ```bash
   cd /home/moshi
   ```
2. Activate the Python virtual environment:
   ```bash
   source env/bin/activate
   ```
3. Start the Moshi server:
   ```bash
   uvicorn moshi_service:app --host 0.0.0.0 --port 8000
   ```
4. Wait for the server to download and load the required model. This may take a few minutes.

---

### **Step 5: Access the Servers**
You can access the servers via Runpod's proxy URLs:
- **Amica server**:  
  `https://rnk7xoszvjhybh-3000.proxy.runpod.net/`
- **Moshi server**:  
  `https://rnk7xoszvjhybh-8000.proxy.runpod.net/`

Replace the `{port-number}` in the URL with the actual port number (3000 for Amica and 8000 for Moshi).

---