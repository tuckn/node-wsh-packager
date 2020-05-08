Option Explicit

'/**
' * アプリケーション/プロセスを終了する
' * @function
' * @param {string}  待ち時間
' */
Function KillProcess( sPname )

  'WMIにて使用する各種オブジェクトを定義・生成する。
  Dim oClassSet
  Dim oClass
  Dim oLocator
  Dim oService
  Dim sMesStr

  'ローカルコンピュータに接続する。
  Set oLocator = WScript.CreateObject("WbemScripting.SWbemLocator")
  Set oService = oLocator.ConnectServer

  'クエリー条件をWQLにて指定する。
  Set oClassSet = oService.ExecQuery("Select * From Win32_Process Where Description=""" & sPname & """")

  'コレクションを解析する。
  For Each oClass In oClassSet
    oClass.Terminate
  Next

  '使用した各種オブジェクトを後片付けする。
  Set oClassSet = Nothing
  Set oClass = Nothing
  Set oService = Nothing
  Set oLocator = Nothing

End Function
