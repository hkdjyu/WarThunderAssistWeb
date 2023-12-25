# War Thunder Assist Web - WTAW

A web application assist displaying fundalmental flight data for War Thunder Air Battles. 

<img src="./snapshot.jpg" width="200" />


## Quick Preview

visit https://wtaw.thomasng.dev/  
It is noted that you can directly use it on your local computer without changing ip address and ip port.

But if you need better networking connection, use the application on your mobile device, or customise the code as you like, please read the details below...

## Features
- Attitude Indicator
- Climb degree and Climb rate
- Speed (IAS), Heading and Altitude display panel
- Status of air break, flaps and landing gear
- Air strike warning sound if any plane is within 2.5 km, disregarding altitude


# Installation Guide
This guide provides steps to self-host a React web application on your local machine.

## Prerequisites

- Git installed
- Node.js (tested on v20.10.0) installed
- npm (tested on 10.2.3) installed 

You can type the following commands in a PowerShell or Command Prompt to check if they are installed

```bash
git --version
node --version
npm --version
```

If they are all installed, somthing look like the below should appear.
```
git version 2.37.2.windows.2
v20.10.0
10.2.3
```

### Useful Links
https://git-scm.com/download/win  (for git installation)  
https://nodejs.org/en/download  (for node installation)

> After finish installing Node using *Windows Installer* , npm should also be installed with Node.

## Getting Started (windows 11)

not tested on windows 10, but should also work fine 

### 1. **Clone the Repository:**

    Search and open **PowerShell**

    **[Alternative]**  
    If you have a desired directory, you can open it through a file explorer, right click empty space, choose **"show more option"**, and click **"open in terminal"**

    **[Contine here]**  

    Input the following command:

    ```bash
    git clone https://github.com/hkdjyu/WarThunderAssistWeb.git
    cd WarThunderAssistWeb
    ```

### 2. **Install Yarn:**

    if yarn is install on your system, you can skip this step.
    You can check it by typing 
    ```bash
    yarn --version
    ```
    if yarn is installed, a version number (e.g. 1.22.21) should be displayed

    If yarn is not installed, run the following command

    ```bash
    npm install -g yarn
    ```

### 3. **Install Dependencies:**
    ```bash
    yarn install
    ```

    Please wait for a while. It takes around 1 - 10 minute.

### 4. **Start the Development Server:**
    ```bash
    yarn start
    ```

    > DO NOT Close PowerShell until you have finish using it.

### 5. **Access the Web Application:**
    Open a web browser and go to `http://localhost:3000` to view the React web application.

### 6. **Connect to your devices**
   
   **Local Machine**  
   for computer with more than one monitor, you can open it in a browser and put it in your secondary display. Click `START` directly when a game or a test flight is started. 
   
   > DO NOT change the HOST IP ADDRESS and HOST PORT.


   **Other Devices (e.g. Phone)**  
  1.  The devices must have the same internet connection to your computer network. That is, you need to connect your devices to the router that have connected to your computer. The connection can be WiFi or LAN. It doesn't matter.
   
  2. Check your computer (with War Thunder Openning) local IP address.  
      Usually it is 192.168.0.XXX or 192.168.1.XXX  
      You can check it by search and open cmd.

      type `ipconfig` and look for Ethernet adapter

      ```
      Ethernet adapter Ethernet:

        Connection-specific DNS Suffix  . :
        IPv4 Address. . . . . . . . . . . : 192.168.0.133
        Subnet Mask . . . . . . . . . . . : 255.255.255.0
        Default Gateway . . . . . . . . . : 192.168.0.1
      ```

      The IPv4 Address, here is `192.168.0.133`, is your **computer local IP address**. Please remember it  

  3. Open a web browser on your other device. Go to   `http://<your_local_IP_address>:3000`
   
  4. On your device, please change   
       `Host IP Address:`  to your **local IP address**  
       Don't forget to click `SET` after finish setting. The updated local address should be displayed directly above the input field.

  5. After finishing HOST IP ADDRESS setting, click `START`

        > DO NOT change the HOST PORT. Leave it with 8111.
    
        Please keep in mind that the web application is batery consuming as it needs to keep fetching data from War Thunder. If you are temporarily not need to use it, simply click `STOP`. If you want to quit, just close the browser tab.

### 7. **Close the Host Server**
   Press `ctrl + c` in your PowerShell window. And then close it  
   Just close the PowerShell window should also work fine :)

### 8.  **Next Time Use**
   1. Open Powershell
   2. Go to the WTAW directory. By default, you can run
        ```bash
        cd ./WarThunderAssistWeb
        ``` 
   3. Run `yarn start`
