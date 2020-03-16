Option Explicit
Function CheckErrNumber(errObject, errTitle)
CheckErrNumber = False
With errObject
If Not .Number = 0 Then
MsgBox "Number: " & .Number & vbNewLine & "Description: " & .Description, vbOKOnly + vbExclamation,  errTitle
Else
CheckErrNumber = True
End If
End With
End Function
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
End Function
Function GetStrWithVbsInputBox(msg)
GetStrWithVbsInputBox = InputBox(msg)
End Function
Function GetVbsTypeName(v)
GetVbsTypeName = TypeName(v)
End Function
