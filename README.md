# Node.js: wsh-packager

Node.js CLI to pack WSH scripts (.js, .vbs) that are defined in a Windows Script File (.wsf).
WSH is an abbreviation for Windows Script Host.

## Installation

```console
npm install -g @tuckn/wsh-packager
```

or download a [released binary file](https://github.com/tuckn/node-wsh-packager/releases).

## Usage

```console
> wsh-packager --help

Usage: wsh-packager [options] <dirPath>

Pack .js, .vbs (WSH scripts) files defined in .wsf file (Windows Script File).

Options:
  -V, --version         output the version number
  -N, --wsf-name <name> Default: Package.wsf
  -h, --help           display help for command
```

### Basic Example

```console
D:\MyWshFolder\
├─ Package.wsf
└─ src\
    ├─ Function.js
    ├─ Object.js
    └─ JSON.js
```

Package.wsf is

```xml
<package>
  <job id = "./dist/JSON.min.js">
    <script language="JScript" src="./src/Function.js"></script>
    <script language="JScript" src="./src/Object.js"></script>
    <script language="JScript" src="./src/JSON.js"></script>
  </job>
</package>
```

and execute the below command.

```console
> wsh-packager "D:\MyWshFolder"
```

The result

```console
D:\MyWshFolder\
├─ Package.wsf
├─ dist\
│  └─ JSON.min.js
└─ src\
    ├─ Function.js
    ├─ Object.js
    └─ JSON.js
```

The created _JSON.min.js_ is packed with the three .js files that are minified.

### Multiple Jobs Packaging

```console
D:\MyWshFolder\
├─ Package.wsf
└─ src\
    ├─ CLI.js
    ├─ Excel.vbs
    ├─ Function.js
    ├─ Object.js
    ├─ JSON.js
    └─ Util.vbs
```

Package.wsf is

```xml
<package>
  <job id = "./dist/MyModule.vbs">
    <script language="VBScript" src="./src/Util.vbs"></script>
    <script language="VBScript" src="./src/Excel.vbs"></script>
  </job>
  <job id = "./dist/JSON.min.js">
    <script language="JScript" src="./src/Function.js"></script>
    <script language="JScript" src="./src/Object.js"></script>
    <script language="JScript" src="./src/JSON.js"></script>
  </job>
  <job id = "./dist/Run.wsf">
    <script language="JScript" src="./src/Function.js"></script>
    <script language="VBScript" src="./src/Excel.vbs"></script>
    <script language="JScript" src="./src/CLI.js"></script>
  </job>
</package>
```

and execute the below command.

```console
> wsh-packager "D:\MyWshFolder"
```

The result

```console
D:\MyWshFolder\
├─ Package.wsf
├─ dist\
│  ├─ JSON.min.js
│  ├─ MyModule.vbs
│  └─ Run.wsf
└─ src\
    ├─ CLI.js
    ├─ Excel.vbs
    ├─ Function.js
    ├─ Object.js
    ├─ JSON.js
    └─ Util.vbs
```

_Run.wsf_ is an executable file on Windows of most versions.

## Documentation

All specifications are written [here](https://docs.tuckn.net/node-wsh-packager).

## License

MIT

Copyright (c) 2020 [Tuckn](https://github.com/tuckn)
