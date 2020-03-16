@ECHO OFF
SET CLI_PATH="%~dp0..\cli.js"
SET SRC_WSF="%~dp0src\Main.wsf"
SET DEST_DIR="%~dp0dest"

ECHO Select test No.
ECHO [1] packScripts / to dest folder
SET /P ANSWER=

IF /i {%ANSWER%}=={1} (
  GOTO :packScriptsToDest
) ELSE (
  GOTO :EOF
)

:packScriptsToDest
@ECHO ON
node.exe %CLI_PATH% packScripts --wsf-path %SRC_WSF% --dest-path %DEST_DIR%
GOTO :EOF