#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

class ExtensionBuilder {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.srcDir = path.join(this.rootDir, 'src');
        this.distDir = path.join(this.rootDir, 'dist');
        this.iconsDir = path.join(this.rootDir, 'icons');
    }

    async build(target = 'all') {
        console.log('🚀 Building Zoho Attendance Extension...');

        // Clean dist directory
        await fs.remove(this.distDir);
        await fs.ensureDir(this.distDir);

        if (target === 'all' || target === 'chrome') {
            await this.buildChrome();
        }

        if (target === 'all' || target === 'firefox') {
            await this.buildFirefox();
        }

        console.log('✅ Build completed successfully!');
    }

    async buildChrome() {
        console.log('📦 Building Chrome extension...');

        const chromeDir = path.join(this.distDir, 'chrome');
        await fs.ensureDir(chromeDir);

        // Copy manifest
        await fs.copy(
            path.join(this.rootDir, 'manifest-chrome.json'),
            path.join(chromeDir, 'manifest.json')
        );

        // Copy source files
        await this.copySourceFiles(chromeDir, 'chrome');

        // Copy icons
        await fs.copy(this.iconsDir, path.join(chromeDir, 'icons'));

        console.log('✅ Chrome extension built');
    }

    async buildFirefox() {
        console.log('🦊 Building Firefox extension...');

        const firefoxDir = path.join(this.distDir, 'firefox');
        await fs.ensureDir(firefoxDir);

        // Copy manifest
        await fs.copy(
            path.join(this.rootDir, 'manifest-firefox.json'),
            path.join(firefoxDir, 'manifest.json')
        );

        // Copy source files
        await this.copySourceFiles(firefoxDir, 'firefox');

        // Copy icons
        await fs.copy(this.iconsDir, path.join(firefoxDir, 'icons'));

        console.log('✅ Firefox extension built');
    }

    async copySourceFiles(targetDir, browser) {
        // Create directory structure
        await fs.ensureDir(path.join(targetDir, 'popup'));
        await fs.ensureDir(path.join(targetDir, 'content'));
        await fs.ensureDir(path.join(targetDir, 'background'));
        await fs.ensureDir(path.join(targetDir, 'common'));

        // Copy popup files
        await fs.copy(
            path.join(this.srcDir, 'popup'),
            path.join(targetDir, 'popup')
        );

        // Copy shared files
        await fs.copy(
            path.join(this.srcDir, 'common'),
            path.join(targetDir, 'common')
        );

        // Copy browser-specific content script
        await fs.copy(
            path.join(this.srcDir, 'content', `content-${browser}.js`),
            path.join(targetDir, 'content', `content-${browser}.js`)
        );

        // Copy browser-specific background script
        await fs.copy(
            path.join(this.srcDir, 'background', `background-${browser}.js`),
            path.join(targetDir, 'background', `background-${browser}.js`)
        );
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
let target = 'all';

if (args.includes('--chrome')) {
    target = 'chrome';
} else if (args.includes('--firefox')) {
    target = 'firefox';
}

// Build extension
const builder = new ExtensionBuilder();
builder.build(target).catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});