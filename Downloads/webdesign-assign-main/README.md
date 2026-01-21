# OOPS Academy LMS

## 1. Prerequisites
*   **VS Code**: Installed.
*   **XAMPP**: Installed (for local server and database).
*   **VS Code Setup**: Install the **"PHP Intelephense"** extension for code completion.

## 2. Project Setup
1.  Move this project folder to: `C:\xampp\htdocs\lms`
2.  Open XAMPP Control Panel and start **Apache** and **MySQL**.
3.  Open the `lms` folder in VS Code.

## 3. Database Setup (Fast Way)
Open the VS Code Terminal (`Ctrl + `) and run these two commands to create and populate the database:

```powershell
# 1. Create the database
c:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS capstone"

# 2. Import the data
cmd /c "c:\xampp\mysql\bin\mysql.exe -u root capstone < db\capstone.sql"
```

## 4. Run the App
Open your browser and visit:
**[http://localhost/lms](http://localhost/lms)**
For live reload just install live server "web extension version "

## Troubleshooting
*   **Database Error?** Run the commands in step 3 again.
*   **Site not loading?** Ensure Apache is green (running) in XAMPP.
