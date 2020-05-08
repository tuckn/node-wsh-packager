Option Explicit

'/**
' * 特定のネットワークが有効になるまで待つ
' * @function
' * @param {String} networkName ネットワーク名
' */
Function WaitNetworkConnection( networkName )

  'On error resume next
  'Err.Clear

  Dim objShell
  Set objShell = WScript.CreateObject("WScript.Shell")

  Dim objWMIService
  Dim colNetCards
  Dim objNetCard

  ' 接続を待つループ回数
  Dim roopCount
  roopCount = 100

  ' ループ処理を行う間隔（msec）
  Dim waitSec
  waitSec = 1000

  Dim i

  ' 接続を待つネットワーク名の格納（引数から
  If networkName = "" Then
    WScript.Echo "引数がありません"
    WScript.Quit
  End If

  Set objWMIService = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\cimv2")
  Set colNetCards = objWMIService.ExecQuery("Select * From Win32_NetworkAdapter Where NetConnectionStatus=2")

  ' networkNameの接続があるまでループする
  For i = 0 To roopCount Step 1
    For Each objNetCard in colNetCards
      ' WScript.Echo objNetCard.NetConnectionID
      ' 接続が確認できればスクリプトを終了する
      If networkName = objNetCard.NetConnectionID Then
        objShell.LogEvent SUCCESS, _
            WScript.ScriptFullName & vbNewLine & _
            networkName & " 接続確認"

        WScript.Sleep(30000)
        Set objShell = Nothing
        WaitNetworkConnection = True
        Exit Function
      End If

      ' 1secの間隔を開けて実行する
      WScript.Sleep(waitSec)
    Next
  Next

  WaitNetworkConnection = False
  objShell.LogEvent ERROR, _
      WScript.ScriptFullName & vbNewLine & _
      networkName & " 接続確認できず"

  Set objShell = Nothing

  'Err.Clear

End Function
