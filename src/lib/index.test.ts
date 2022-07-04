import * as fsh from '@tuckn/fs-hospitality';
import { execSync } from 'child_process';
import * as fse from 'fs-extra';
import * as path from 'path';

import * as wpkg from './index';

const dirAssets = path.resolve(__dirname, '../../assets');

describe('wsh-packager', () => {
  test('minifyJsCode', () => {
    const jsCode = ` // Polyfill to extend functions of String

if (!String.prototype.includes) {
  /**
   * Determines whether one string may be found within another string, returning true or false as appropriate. From ECMA-262 6 edition. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes|MDN}
   */
  String.prototype.includes = function (searchString, position) {
    if (searchString instanceof RegExp) {
      throw new Error('first argument must not be a RegExp');
    }

    if (position === undefined) position = 0;

    return this.indexOf(searchString, position) !== -1;
  };
}

var sentence = 'The quick brown fox jumps over the lazy dog.';
var word = 'fox';

WScript.Echo('sentence.includes(word) is "' + sentence.includes(word) + '"');
`;

    const expectingCode = `String.prototype.includes||(String.prototype.includes=function(searchString,position){if(searchString instanceof RegExp)throw new Error("first argument must not be a RegExp");return position===undefined&&(position=0),-1!==this.indexOf(searchString,position)});var sentence="The quick brown fox jumps over the lazy dog.",word="fox";WScript.Echo('sentence.includes(word) is "'+sentence.includes(word)+'"');`;

    const minifiedCode = wpkg.minifyJsCode(jsCode);
    expect(minifiedCode).toBe(expectingCode);

    // Testing run
    const tempWsfCode = wpkg.surroundWithPackageJob(
      wpkg.surroundWshCode(minifiedCode, 'JScript'),
    );
    const tempWsfPath = fsh.makeTmpPath('', '', '.wsf');

    fsh.writeAsTextSync(tempWsfPath, tempWsfCode, {
      eol: 'crlf',
      bom: true,
      encoding: 'utf8',
    });

    const stdout = execSync(`cscript //nologo "${tempWsfPath}"`, {
      encoding: 'utf8',
    });
    expect(stdout).toEqual(
      expect.stringContaining('sentence.includes(word) is "true"'),
    );

    fse.removeSync(tempWsfPath); // Clean
  });

  test('minifyVbsCode', () => {
    const vbsCode = `Option Explicit

' @Function CheckErrNumber
Function CheckErrNumber(errObject, errTitle)
  CheckErrNumber = False ' The default return value

  With errObject
    If Not .Number = 0 Then
      MsgBox "Number: " & .Number & vbNewLine & _
          "Description: " & .Description, _
          vbOKOnly + vbExclamation,  errTitle
    Else
      CheckErrNumber = True
    End If
  End With
End Function


' @Function GetVbsTypeName
' @Description Return a variable type. for JScript.
Function GetVbsTypeName(v)
  GetVbsTypeName = TypeName(v)
End Function

WScript.Echo("Type is " & GetVbsTypeName("二バイト文字"))
`;

    const expectingCode = `Option Explicit
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
Function GetVbsTypeName(v)
GetVbsTypeName = TypeName(v)
End Function
WScript.Echo("Type is " & GetVbsTypeName("二バイト文字"))
`;

    const minifiedCode = wpkg.minifyVbsCode(vbsCode);
    expect(minifiedCode).toBe(expectingCode);

    // Testing run
    const tempWsfCode = wpkg.surroundWithPackageJob(
      wpkg.surroundWshCode(minifiedCode, 'VBScript'),
    );
    const tempWsfPath = fsh.makeTmpPath('', '', '.wsf');

    fsh.writeAsTextSync(tempWsfPath, tempWsfCode, {
      eol: 'crlf',
      bom: true,
      encoding: 'utf8',
    });

    const stdout = execSync(`cscript //nologo "${tempWsfPath}"`, {
      encoding: 'utf8',
    });
    expect(stdout).toEqual(expect.stringContaining('Type is String'));

    fse.removeSync(tempWsfPath); // Clean
  });

  test('bundleJScriptSrcs', () => {
    const baseDir = dirAssets;
    const srcs = [
      './subDir/Function.js',
      './subDir/Object.js',
      './subDir/JSON.js',
    ];
    let bundledCode = wpkg.bundleJScriptSrcs(srcs, { baseDir });

    // Testing run
    // Add the test code
    bundledCode += 'WScript.Echo(JSON.stringify({ foo: "bar" }));';
    const tempWsfCode = wpkg.surroundWithPackageJob(
      wpkg.surroundWshCode(bundledCode, 'JScript'),
    );
    const tempWsfPath = fsh.makeTmpPath('', '', '.wsf');

    fsh.writeAsTextSync(tempWsfPath, tempWsfCode, {
      eol: 'crlf',
      bom: true,
      encoding: 'utf8',
    });

    const stdout = execSync(`cscript //nologo "${tempWsfPath}"`, {
      encoding: 'utf8',
    });
    expect(stdout).toEqual(expect.stringContaining('{"foo":"bar"}'));

    fse.removeSync(tempWsfPath); // Clean

    expect(() => wpkg.bundleJScriptSrcs([])).toThrow();
  });

  test('bundleVBScriptSrcs', () => {
    const baseDir = dirAssets;
    const srcs = [
      './IsBootingProcess.vbs', // UTF-8 LF
      './KillProcess.vbs', // Shift_JIS CRLF
      './WaitNetworkConnection.vbs', // UTF-8 BOM CRLF
      './Util.vbs',
    ];
    let bundledCode = wpkg.bundleVBScriptSrcs(srcs, { baseDir });

    // Testing run
    // Add the test code
    bundledCode += 'WScript.Echo("Type is " & GetVbsTypeName("二バイト文字"))';
    const tempWsfCode = wpkg.surroundWithPackageJob(
      wpkg.surroundWshCode(bundledCode, 'VBScript'),
    );
    const tempWsfPath = fsh.makeTmpPath('', '', '.wsf');

    fsh.writeAsTextSync(tempWsfPath, tempWsfCode, {
      eol: 'crlf',
      bom: true,
      encoding: 'utf8',
    });

    const stdout = execSync(`cscript //nologo "${tempWsfPath}"`, {
      encoding: 'utf8',
    });
    expect(stdout).toEqual(expect.stringContaining('Type is String'));

    fse.removeSync(tempWsfPath); // Clean

    expect(() => wpkg.bundleVBScriptSrcs([])).toThrow();
  });

  test('surroundWshCode', () => {
    expect(() => wpkg.surroundWshCode('', 'JScript')).toThrow();
    expect(() => wpkg.surroundWshCode('WScript.Echo "foo"', '')).toThrow();
  });

  test('surroundWithPackageJob', () => {
    expect(() => wpkg.surroundWithPackageJob('')).toThrow();
  });

  test('bundleWsfJob', () => {
    const baseDir = dirAssets;
    const wshObjs = [
      { attributes: { language: 'VBScript', src: './Util.vbs' } },
      { attributes: { language: 'JScript', src: './subDir/Function.js' } },
      { attributes: { language: 'JScript', src: './subDir/Object.js' } },
      { attributes: { language: 'JScript', src: './subDir/JSON.js' } },
      { attributes: { language: 'JScript', src: './EchoFooBar.js' } },
    ];
    const bundledCode = wpkg.bundleWsfJob(wshObjs, { baseDir });

    // Testing run
    const tempWsfPath = fsh.makeTmpPath('', '', '.wsf');
    fsh.writeAsTextSync(tempWsfPath, bundledCode, {
      eol: 'crlf',
      bom: true,
      encoding: 'utf8',
    });

    const stdout = execSync(`cscript //nologo "${tempWsfPath}"`, {
      encoding: 'utf8',
    });
    expect(stdout).toEqual(expect.stringContaining('{"foo":"bar"}'));

    fse.removeSync(tempWsfPath); // Clean

    expect(() => wpkg.bundleWsfJob([])).toThrow();
  });

  test('_setWsfPath', () => {
    const wsfPath = path.join(dirAssets, 'Package.wsf');
    const customFileName = path.join(dirAssets, 'CustomFileName.wsf');
    const noneExistingPath = path.join(dirAssets, 'NONE_EXISTING_FILE.wsf');

    // Specifying a directory path
    expect(wpkg._setWsfPath(dirAssets)).toBe(wsfPath);
    // Specifying the default wsf path
    expect(wpkg._setWsfPath(wsfPath)).toBe(wsfPath);
    // Specifying a custom wsf path
    expect(wpkg._setWsfPath(customFileName)).toBe(customFileName);
    // Specifying none existing path
    expect(() => wpkg._setWsfPath(noneExistingPath)).toThrow();

    expect(() => wpkg._setWsfPath('')).toThrow();
  });

  test('bundleWshFiles', () => {
    const dirWshPj = path.join(dirAssets, 'WshSample');
    const dirDist = path.join(dirWshPj, 'dist');
    fse.removeSync(dirDist); // Clean

    wpkg.bundleWshFiles(dirWshPj, { ignoreSrc: 'IgnoredSrc\\.js' });

    let relNames: ReturnType<typeof fsh.readdirRecursivelySync>;
    relNames = fsh.readdirRecursivelySync(dirDist);
    expect(relNames).toHaveLength(3);
    expect(relNames).toEqual(['index.js', 'index.vbs', 'run.wsf']);

    // Testing run
    const wsfPath = path.join(dirDist, 'run.wsf');
    const stdout = execSync(`cscript //nologo "${wsfPath}"`, {
      encoding: 'utf8',
    });
    expect(stdout).toEqual(
      expect.stringContaining(
        '[Type: String] "Foo.js" called from "Bar.js", Bar.js called from "Qux.js"',
      ),
    );

    fse.removeSync(dirDist); // Clean

    // Filtering with job id
    wpkg.bundleWshFiles(dirWshPj, { jobId: '\\.js$' });

    relNames = fsh.readdirRecursivelySync(dirDist);
    expect(relNames).toHaveLength(1);
    expect(relNames).toEqual(['index.js']);

    fse.removeSync(dirDist); // Clean

    expect(() => wpkg.bundleWshFiles('')).toThrow();
  });
});
