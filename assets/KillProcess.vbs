Option Explicit

'/**
' * �A�v���P�[�V����/�v���Z�X���I������
' * @function
' * @param {string}  �҂�����
' */
Function KillProcess( sPname )

  'WMI�ɂĎg�p����e��I�u�W�F�N�g���`�E��������B
  Dim oClassSet
  Dim oClass
  Dim oLocator
  Dim oService
  Dim sMesStr

  '���[�J���R���s���[�^�ɐڑ�����B
  Set oLocator = WScript.CreateObject("WbemScripting.SWbemLocator")
  Set oService = oLocator.ConnectServer

  '�N�G���[������WQL�ɂĎw�肷��B
  Set oClassSet = oService.ExecQuery("Select * From Win32_Process Where Description=""" & sPname & """")

  '�R���N�V��������͂���B
  For Each oClass In oClassSet
    oClass.Terminate
  Next

  '�g�p�����e��I�u�W�F�N�g����Еt������B
  Set oClassSet = Nothing
  Set oClass = Nothing
  Set oService = Nothing
  Set oLocator = Nothing

End Function
