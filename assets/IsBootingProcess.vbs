Option Explicit

'/**
' * プロセスが動いているかチェックする関数
' */
Function IsBootingProcess( pName )

  IsBootingProcess = False

  On Error Resume Next

  Dim objPWMI
  Set objPWMI = GetObject("winmgmts:{impersonationLevel=impersonate}!\\localhost\root\cimv2")

  Err.Clear
  On Error GoTo 0
  
  If Err.Number <> 0 Then
    Exit Function  '接続できなかったら、終了
  End If

  Dim colProc
  Set colProc = objPWMI.ExecQuery("Select * from Win32_Process WHERE Name='" & pName & "'")
  
  If colProc.Count > 0 Then
    IsBootingProcess = True
  End If
  
End Function
