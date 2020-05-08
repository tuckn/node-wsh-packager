Option Explicit

'/**
' * @Function CheckErrNumber {{{
' * @Description
' */
Function CheckErrNumber(errObject, errTitle)
  CheckErrNumber = False

  With errObject
    If Not .Number = 0 Then
      MsgBox "Number: " & .Number & vbNewLine & _
          "Description: " & .Description, _
          vbOKOnly + vbExclamation,  errTitle
    Else
      CheckErrNumber = True
    End If
  End With
End Function ' }}}

'/**
' * @Function ConvertJsArrayToVbArray {{{
' * @Link http://taka-2.hatenablog.jp/entry/20111007/p2
' */
Function ConvertJsArrayToVbArray(jsArry)
  Dim i, elem
  Dim len: len = jsArry.length
  Dim vbArry()
  ReDim vbArry(len - 1)

  For i = 1 to len
    elem = jsArry.shift()
    vbArry(i - 1) = elem
  Next

  ConvertJsArrayToVbArray = vbArry
End Function ' }}}

'/**
' * @Function GetStrWithVbsInputBox {{{
' * @Description InputBox for JScript
' * @Param msg {String} 表示するメッセージ
' * "キャンセル"ボタンを押した場合、呼び出したJScriptにundefinedが返る
' */
Function GetStrWithVbsInputBox(msg)
  GetStrWithVbsInputBox = InputBox(msg)
End Function ' }}}

'/**
' * @Function GetVbsTypeName {{{
' * @Description Retrun a variable type. for JScript.
' */
Function GetVbsTypeName(v)
  GetVbsTypeName = TypeName(v)
End Function ' }}}

Function GetBar()
  GetBar = "bar"
End Function
