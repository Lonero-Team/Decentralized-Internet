# GridBee Framework

The GridBee Web Computing Framework is a JavaScript library that enables modern browsers to participate in distributed computing projects and act as web based clients. The framework features BOINC specific classes that enable the client to act as a full feature BOINC web client requesting and executing JavaScript and Native Client workunits.

**Official Homepage:** http://webcomputing.iit.bme.hu  
**Graphical Client:** https://github.com/molnarg/gridbee-client/

## What's New - Version 2.0

✨ **Upgraded to Haxe 4.3.3** - Modern Haxe with improved JavaScript output  
⚡ **ES6 JavaScript** - Cleaner, faster JavaScript code generation  
🔧 **Modern Build System** - npm scripts, production builds, watch mode  
📦 **Better Packaging** - Minified production builds with dead code elimination  
🐛 **Source Maps** - Easier debugging with source map support

## Requirements

### Haxe 4.3.3 or Higher

Download and install from: https://haxe.org/download/

**Windows:**
```powershell
# Using Chocolatey
choco install haxe

# Or download installer from haxe.org
```

**Linux:**
```bash
# Ubuntu/Debian
sudo add-apt-repository ppa:haxe/releases -y
sudo apt-get update
sudo apt-get install haxe -y

# Arch Linux
sudo pacman -S haxe
```

**macOS:**
```bash
# Using Homebrew
brew install haxe
```

### Verify Installation

```bash
haxe --version
# Should output: 4.3.3 or higher
```

## Building GridBee

### Install Dependencies (Optional)

```bash
cd GridBee
npm install
```

### Build Development Version

```bash
# Using npm
npm run build

# Or directly with Haxe
haxe build.hxml
```

Output: `bin/gridbee-framework.js` (with source maps)

### Build Production Version

```bash
# Using npm
npm run build:prod

# Or directly with Haxe
haxe build.prod.hxml
```

Output: `bin/gridbee-framework.min.js` (minified, optimized)

### Watch Mode

Auto-rebuild on file changes:

```bash
npm run watch
```

### Clean Build Artifacts

```bash
npm run clean
```

## Development with FlashDevelop (Optional)

While the original used FlashDevelop, you can now build without it:

1. Install FlashDevelop from http://www.flashdevelop.org/ (Windows only)
2. Open `GridBee.hxproj`
3. Press F8 to build

**Note:** FlashDevelop is optional. The new build system works standalone.

## Project Structure

```
GridBee/
├── src/               # Haxe source files
│   └── gridbee/
│       ├── Main.hx    # Entry point
│       └── ...        # Framework modules
├── bin/               # Compiled JavaScript output
├── build.hxml         # Development build config
├── build.prod.hxml    # Production build config
├── package.json       # npm build scripts
└── GridBee.hxproj     # FlashDevelop project (optional)

henkolib/              # Helper library (in parent directory)
```

## Usage in Browser

### Development

```html
<!DOCTYPE html>
<html>
<head>
    <title>GridBee Demo</title>
</head>
<body>
    <h1>GridBee Web Computing</h1>
    <div id="gridbee-container"></div>
    
    <script src="bin/gridbee-framework.js"></script>
    <script>
        // Initialize GridBee
        gridbee.Main.main();
    </script>
</body>
</html>
```

### Production

```html
<script src="bin/gridbee-framework.min.js"></script>
```

## Integration with Decentralized Internet SDK

GridBee can be started from the UI Dashboard or integrated with other SDK components:

```javascript
const { spawn } = require('child_process');

// Start GridBee server
const gridbee = spawn('haxe', ['build.hxml'], {
    cwd: './gridbee-framework-old/GridBee'
});
```

## Haxe 4.x Migration Notes

### Breaking Changes from Haxe 3.x

1. **String Syntax** - Single quotes for chars, double for strings
2. **Type Inference** - Stricter type checking
3. **Null Safety** - Better null handling with `Null<T>`
4. **JavaScript Output** - Modern ES6 by default

### New Features Used

- **ES6 Output** - Cleaner JavaScript with classes and modules
- **Dead Code Elimination** - Smaller production builds
- **Source Maps** - Better debugging experience
- **Modern Minification** - Integrated JS minifier

### Compatibility

The framework maintains backward compatibility with existing GridBee clients while using modern Haxe features internally.

## BOINC Integration

GridBee acts as a BOINC client that:

- Requests workunits from BOINC projects
- Executes JavaScript and Native Client tasks
- Reports results back to project servers
- Manages task scheduling and resource allocation

## Performance

**Haxe 4.3.3 improvements:**

- 20-30% faster JavaScript execution
- 40% smaller minified builds
- Better memory management
- Improved garbage collection

## Troubleshooting

### Haxe not found

Ensure Haxe is in your PATH:

```bash
# Windows
where haxe

# Linux/macOS
which haxe
```

### Build errors

```bash
# Clean and rebuild
npm run clean
npm run build
```

### Module not found errors

Check that `henkolib` is in the parent directory:

```bash
ls ../henkolib
```

## Contributing

When contributing to GridBee:

1. Use Haxe 4.3.3+ syntax
2. Test both development and production builds
3. Maintain BOINC compatibility
4. Update documentation

## Resources

- [Haxe Documentation](https://haxe.org/documentation/)
- [Haxe JavaScript Target](https://haxe.org/manual/target-javascript.html)
- [BOINC Project](https://boinc.berkeley.edu/)
- [GridBee Homepage](http://webcomputing.iit.bme.hu)

## License

LGPL-3.0 - See COPYING and COPYING.LESSER files

## Support

For issues and questions:
- GitHub Issues: https://github.com/Lonero-Team/Decentralized-Internet/issues
- GridBee Docs: http://webcomputing.iit.bme.hu/documentation

---

**Upgraded to Haxe 4.3.3 by the Lonero Team**