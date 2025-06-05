#!/usr/bin/env node

/**
 * Package Script for Zoho Attendance Extension
 * 
 * Educational Purpose: Learn about distribution packaging for browser extensions
 * This script creates release-ready packages for both Chrome and Firefox
 * 
 * Usage: npm run package
 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

class ExtensionPackager {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.distDir = path.join(this.rootDir, 'dist');
        this.packagesDir = path.join(this.rootDir, 'packages');
        this.timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    }

    async package() {
        console.log('📦 Starting extension packaging process...');
        console.log('⚠️  Educational Purpose: Learning distribution packaging\n');

        try {
            // Ensure builds exist
            await this.ensureBuildsExist();

            // Create packages directory
            await this.setupPackagesDirectory();

            // Package Chrome extension
            await this.packageChrome();

            // Package Firefox extension
            await this.packageFirefox();

            // Generate checksums
            await this.generateChecksums();

            // Create release notes
            await this.createReleaseNotes();

            console.log('\n✅ Packaging completed successfully!');
            console.log('📁 Packages created in:', this.packagesDir);

        } catch (error) {
            console.error('\n❌ Packaging failed:', error.message);
            process.exit(1);
        }
    }

    async ensureBuildsExist() {
        console.log('🔍 Checking for existing builds...');

        const chromeBuild = path.join(this.distDir, 'chrome');
        const firefoxBuild = path.join(this.distDir, 'firefox');

        if (!await fs.pathExists(chromeBuild) || !await fs.pathExists(firefoxBuild)) {
            console.log('🔨 Builds not found, creating them...');

            try {
                execSync('npm run build:all', {
                    cwd: this.rootDir,
                    stdio: 'inherit'
                });
                console.log('✅ Builds created successfully');
            } catch (error) {
                throw new Error('Failed to create builds: ' + error.message);
            }
        } else {
            console.log('✅ Builds found');
        }
    }

    async setupPackagesDirectory() {
        console.log('📁 Setting up packages directory...');

        // Remove old packages directory
        await fs.remove(this.packagesDir);

        // Create fresh packages directory
        await fs.ensureDir(this.packagesDir);

        console.log('✅ Packages directory ready');
    }

    async packageChrome() {
        console.log('\n📦 Packaging Chrome extension...');

        const chromeDir = path.join(this.distDir, 'chrome');
        const manifest = await this.readManifest(chromeDir);
        const packageName = `zoho-attendance-chrome-v${manifest.version}-${this.timestamp}.zip`;
        const packagePath = path.join(this.packagesDir, packageName);

        await this.createZipArchive(chromeDir, packagePath, 'Chrome');

        // Create symbolic link for latest version
        const latestPath = path.join(this.packagesDir, 'zoho-attendance-chrome-latest.zip');
        await fs.remove(latestPath);
        await fs.copy(packagePath, latestPath);

        console.log(`✅ Chrome package created: ${packageName}`);
        return packagePath;
    }

    async packageFirefox() {
        console.log('\n🦊 Packaging Firefox extension...');

        const firefoxDir = path.join(this.distDir, 'firefox');
        const manifest = await this.readManifest(firefoxDir);
        const packageName = `zoho-attendance-firefox-v${manifest.version}-${this.timestamp}.zip`;
        const packagePath = path.join(this.packagesDir, packageName);

        await this.createZipArchive(firefoxDir, packagePath, 'Firefox');

        // Create symbolic link for latest version
        const latestPath = path.join(this.packagesDir, 'zoho-attendance-firefox-latest.zip');
        await fs.remove(latestPath);
        await fs.copy(packagePath, latestPath);

        console.log(`✅ Firefox package created: ${packageName}`);
        return packagePath;
    }

    async createZipArchive(sourceDir, outputPath, browserName) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression
            });

            let totalFiles = 0;
            let totalSize = 0;

            output.on('close', () => {
                const finalSize = archive.pointer();
                console.log(`   📊 ${browserName} package stats:`);
                console.log(`      Files: ${totalFiles}`);
                console.log(`      Uncompressed: ${this.formatBytes(totalSize)}`);
                console.log(`      Compressed: ${this.formatBytes(finalSize)}`);
                console.log(`      Compression ratio: ${((1 - finalSize / totalSize) * 100).toFixed(1)}%`);
                resolve();
            });

            output.on('error', reject);
            archive.on('error', reject);

            archive.on('entry', (entry) => {
                totalFiles++;
                totalSize += entry.stats.size;
            });

            archive.pipe(output);

            // Add all files from source directory
            archive.directory(sourceDir, false);

            archive.finalize();
        });
    }

    async readManifest(buildDir) {
        const manifestPath = path.join(buildDir, 'manifest.json');

        if (!await fs.pathExists(manifestPath)) {
            throw new Error(`Manifest not found: ${manifestPath}`);
        }

        const manifestContent = await fs.readFile(manifestPath, 'utf8');
        return JSON.parse(manifestContent);
    }

    async generateChecksums() {
        console.log('\n🔐 Generating checksums...');

        const crypto = require('crypto');
        const packages = await fs.readdir(this.packagesDir);
        const zipFiles = packages.filter(file => file.endsWith('.zip'));

        const checksums = {};

        for (const file of zipFiles) {
            const filePath = path.join(this.packagesDir, file);
            const content = await fs.readFile(filePath);

            checksums[file] = {
                sha256: crypto.createHash('sha256').update(content).digest('hex'),
                sha512: crypto.createHash('sha512').update(content).digest('hex'),
                size: content.length
            };
        }

        const checksumsPath = path.join(this.packagesDir, 'checksums.json');
        await fs.writeFile(checksumsPath, JSON.stringify(checksums, null, 2));

        // Also create SHA256SUMS file for command line verification
        const sha256Content = Object.entries(checksums)
            .map(([file, hashes]) => `${hashes.sha256}  ${file}`)
            .join('\n');

        const sha256Path = path.join(this.packagesDir, 'SHA256SUMS');
        await fs.writeFile(sha256Path, sha256Content);

        console.log('✅ Checksums generated');
        console.log('   📄 checksums.json - Detailed hash information');
        console.log('   📄 SHA256SUMS - Command line verification format');
    }

    async createReleaseNotes() {
        console.log('\n📝 Creating release notes...');

        const packageJson = await fs.readJSON(path.join(this.rootDir, 'package.json'));
        const chromeManifest = await this.readManifest(path.join(this.distDir, 'chrome'));
        const firefoxManifest = await this.readManifest(path.join(this.distDir, 'firefox'));

        const releaseNotes = this.generateReleaseNotesContent({
            version: packageJson.version,
            chromeManifest,
            firefoxManifest,
            timestamp: this.timestamp,
            buildInfo: await this.getBuildInfo()
        });

        const releaseNotesPath = path.join(this.packagesDir, 'RELEASE_NOTES.md');
        await fs.writeFile(releaseNotesPath, releaseNotes);

        console.log('✅ Release notes created');
    }

    generateReleaseNotesContent(info) {
        return `# Release Notes - Zoho Attendance Extension

> ⚠️ **Educational Purpose Only** - This release is for learning browser extension development

## Version ${info.version}
**Release Date:** ${new Date().toISOString().split('T')[0]}  
**Build Timestamp:** ${info.timestamp}

## 🎓 Educational Release Information

This release demonstrates browser extension development concepts including:
- Cross-browser compatibility (Chrome & Firefox)
- Modern extension architecture patterns
- Build automation and packaging workflows
- Security best practices and permission handling

## 📦 Package Information

### Chrome Extension
- **Manifest Version:** ${info.chromeManifest.manifest_version}
- **Extension Version:** ${info.chromeManifest.version}
- **Target Browser:** Chrome/Chromium/Edge >= 88
- **Package:** \`zoho-attendance-chrome-latest.zip\`

### Firefox Extension  
- **Manifest Version:** ${info.firefoxManifest.manifest_version}
- **Extension Version:** ${info.firefoxManifest.version}
- **Target Browser:** Firefox/LibreWolf >= 78
- **Package:** \`zoho-attendance-firefox-latest.zip\`

## 🔧 Build Information

${info.buildInfo}

## 📋 Installation Instructions

### Educational Use Only
1. **Download appropriate package** for your browser
2. **Extract to development directory**
3. **Load as unpacked extension** in developer mode
4. **Use only with test accounts** and development environments

### Chrome Installation
\`\`\`bash
# Extract package
unzip zoho-attendance-chrome-latest.zip -d chrome-extension/

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select extracted directory
\`\`\`

### Firefox Installation
\`\`\`bash
# Extract package
unzip zoho-attendance-firefox-latest.zip -d firefox-extension/

# Load in Firefox
# 1. Go to about:debugging
# 2. Click "This Firefox"
# 3. Click "Load Temporary Add-on"
# 4. Select manifest.json from extracted directory
\`\`\`

## 🔒 Security and Ethics

### Important Reminders
- ✅ **Educational use only** - Learn extension development concepts
- ✅ **Development environments** - Use test accounts and staging systems
- ✅ **Security awareness** - Understand permission models and risks
- ✅ **Ethical considerations** - Respect workplace policies and terms of service

### Never Use For
- ❌ **Production automation** - Real workplace attendance systems
- ❌ **Policy circumvention** - Bypassing employer requirements
- ❌ **Unauthorized access** - Systems without explicit permission
- ❌ **Commercial purposes** - Business or profit-generating activities

## 🐛 Known Educational Issues

This is an educational project with intentional limitations:

1. **Limited Testing** - Not comprehensively tested across all configurations
2. **Simplified Error Handling** - Focus on learning, not production robustness  
3. **Basic Security** - Educational security patterns, not enterprise-grade
4. **Documentation Focus** - Prioritizes learning over feature completeness

## 📚 Learning Resources

### Browser Extension Development
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [MDN WebExtensions Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

### Related Educational Projects
- Docker API Version: Learn server-side automation concepts
- OAuth 2.0 Examples: Understand authentication flows
- Cross-browser Compatibility: Study browser differences

## 📞 Educational Support

### Questions and Learning
- 🐛 [Report issues for learning discussion](https://github.com/yourusername/zoho-attendance-extension/issues)
- 💡 [Educational improvements and suggestions](https://github.com/yourusername/zoho-attendance-extension/discussions)
- 📚 [Documentation improvements](https://github.com/yourusername/zoho-attendance-extension/pulls)

### Code Review and Contributions
We welcome educational contributions that:
- Improve code quality and best practices
- Enhance cross-browser compatibility examples
- Add better educational documentation
- Demonstrate security patterns and considerations

## ⚖️ Legal and Ethical Considerations

### Disclaimer
This software is provided for educational purposes only. Users are responsible for:
- Compliance with applicable laws and regulations
- Respect for workplace policies and employment agreements
- Ethical use of automation and web technologies
- Understanding and managing security implications

### License
MIT License - See LICENSE file for full terms

---

**Remember: The goal is to learn and understand browser extension development. Use these skills to build legitimate, helpful applications that make the web better for everyone.**

## 🔍 Package Verification

Verify package integrity using checksums:

\`\`\`bash
# Verify SHA256 checksums
sha256sum -c SHA256SUMS

# Or check individual files
sha256sum zoho-attendance-chrome-latest.zip
sha256sum zoho-attendance-firefox-latest.zip
\`\`\`

---

*Generated on ${new Date().toISOString()}*
*Build: ${info.timestamp}*
`;
    }

    async getBuildInfo() {
        try {
            const gitHash = execSync('git rev-parse --short HEAD', {
                cwd: this.rootDir,
                encoding: 'utf8'
            }).trim();

            const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', {
                cwd: this.rootDir,
                encoding: 'utf8'
            }).trim();

            const nodeVersion = process.version;
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();

            return `- **Git Commit:** ${gitHash}
- **Git Branch:** ${gitBranch}
- **Node.js Version:** ${nodeVersion}
- **npm Version:** ${npmVersion}
- **Build Platform:** ${process.platform} ${process.arch}`;

        } catch (error) {
            return `- **Build Platform:** ${process.platform} ${process.arch}
- **Node.js Version:** ${process.version}
- **Build Info:** Limited (Git not available)`;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async validatePackages() {
        console.log('\n🔍 Validating packages...');

        const packages = await fs.readdir(this.packagesDir);
        const zipFiles = packages.filter(file => file.endsWith('.zip') && !file.includes('latest'));

        for (const zipFile of zipFiles) {
            const zipPath = path.join(this.packagesDir, zipFile);

            try {
                // Basic validation - try to read the zip
                const AdmZip = require('adm-zip');
                const zip = new AdmZip(zipPath);
                const entries = zip.getEntries();

                const hasManifest = entries.some(entry => entry.entryName === 'manifest.json');
                const hasPopup = entries.some(entry => entry.entryName.includes('popup.html'));

                console.log(`   ✅ ${zipFile}: ${entries.length} files, manifest: ${hasManifest}, popup: ${hasPopup}`);

            } catch (error) {
                console.log(`   ❌ ${zipFile}: Validation failed - ${error.message}`);
            }
        }
    }

    async showPackageSummary() {
        console.log('\n📊 Package Summary');
        console.log('==================');

        const packages = await fs.readdir(this.packagesDir);

        for (const file of packages) {
            const filePath = path.join(this.packagesDir, file);
            const stats = await fs.stat(filePath);

            console.log(`📄 ${file}`);
            console.log(`   Size: ${this.formatBytes(stats.size)}`);
            console.log(`   Modified: ${stats.mtime.toISOString()}`);
            console.log('');
        }

        console.log('🔗 Quick Commands:');
        console.log(`   cd ${path.relative(process.cwd(), this.packagesDir)}`);
        console.log('   sha256sum -c SHA256SUMS');
        console.log('   unzip zoho-attendance-chrome-latest.zip -d test-chrome/');
        console.log('   unzip zoho-attendance-firefox-latest.zip -d test-firefox/');
    }
}

// CLI argument parsing
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        validate: args.includes('--validate'),
        verbose: args.includes('--verbose') || args.includes('-v'),
        help: args.includes('--help') || args.includes('-h')
    };

    if (options.help) {
        console.log(`
📦 Extension Packaging Script

Usage: node scripts/package.js [options]

Options:
  --validate, -v    Validate packages after creation
  --verbose         Enable verbose output  
  --help, -h        Show this help message

Examples:
  npm run package              # Standard packaging
  node scripts/package.js      # Direct script execution
  npm run package -- --validate   # Package and validate

Educational Purpose:
  This script demonstrates distribution packaging for browser extensions,
  including compression, checksums, and release documentation.
`);
        process.exit(0);
    }

    return options;
}

// Main execution
async function main() {
    const options = parseArgs();
    const packager = new ExtensionPackager();

    try {
        await packager.package();

        if (options.validate) {
            await packager.validatePackages();
        }

        await packager.showPackageSummary();

    } catch (error) {
        console.error('❌ Packaging failed:', error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = ExtensionPackager;