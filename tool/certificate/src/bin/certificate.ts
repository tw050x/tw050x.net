#!/usr/bin/env node

import * as path from 'path';
import { createCA, createCert } from '../generator.js';
import { validateCA } from '../validator.js';

// Usage:
//   certificate create-ca --dir=<directory>
//   certificate create-cert --ca-dir=<ca-directory> --cert-dir=<cert-directory> --name=<name> [--domains=<domain1,domain2>]

const args = process.argv.slice(2);

const command = args[0];

function readFlag(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = args.find((a: string) => a.startsWith(prefix));
  return found ? found.substring(prefix.length) : undefined;
}

function getInvocationCwd(): string {
  return process.env.INIT_CWD || process.env.PROJECT_CWD || process.cwd();
}

function getInstallCommand(caCertPath: string): string {
  const platform = process.platform;
  if (platform === 'darwin') {
    return `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${caCertPath}`;
  } else if (platform === 'win32') {
    return `certutil -addstore -f "ROOT" ${caCertPath}`;
  } else {
    return `sudo cp ${caCertPath} /usr/local/share/ca-certificates/ && sudo update-ca-certificates`;
  }
}

async function main() {
  if (!command || !['create-ca', 'create-cert'].includes(command)) {
    console.log('Usage:');
    console.log('  certificate create-ca --dir=<directory>');
    console.log('  certificate create-cert --ca-dir=<ca-directory> --cert-dir=<cert-directory> --name=<name> [--domains=<domain1,domain2>]');
    process.exit(1);
  }

  const baseCwd = getInvocationCwd();

  if (command === 'create-ca') {
    const dirFlag = readFlag('dir');
    if (!dirFlag) {
      console.error('--dir is required for create-ca');
      process.exit(1);
    }
    const caDir = path.isAbsolute(dirFlag) ? dirFlag : path.resolve(baseCwd, dirFlag);

    try {
      const caFiles = await createCA({ dir: caDir });
      console.log(`Certificate Authority created successfully!`);
      console.log(`Certificate: ${caFiles.certPath}`);
      console.log(`Private Key: ${caFiles.keyPath}`);
      console.log('');
      console.log('To install/trust the Certificate Authority on your system, run:');
      console.log(getInstallCommand(caFiles.certPath));
    } catch (error) {
      console.error('Error creating CA:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  } else if (command === 'create-cert') {
    const caDirFlag = readFlag('ca-dir');
    const certDirFlag = readFlag('cert-dir');
    const nameFlag = readFlag('name');
    const domainsFlag = readFlag('domains');

    if (!caDirFlag || !certDirFlag || !nameFlag) {
      console.error('--ca-dir, --cert-dir, and --name are required for create-cert');
      process.exit(1);
    }

    const caDir = path.isAbsolute(caDirFlag) ? caDirFlag : path.resolve(baseCwd, caDirFlag);
    const certDir = path.isAbsolute(certDirFlag) ? certDirFlag : path.resolve(baseCwd, certDirFlag);
    const domains = domainsFlag ? domainsFlag.split(',').map(d => d.trim()) : [];

    if (!validateCA(caDir)) {
      console.error('Invalid CA directory. Please ensure the CA exists.');
      process.exit(1);
    }

    try {
      const certFiles = await createCert({
        caDir,
        certDir,
        name: nameFlag,
        domains
      });
      console.log(`Certificate created successfully!`);
      console.log(`Certificate: ${certFiles.certPath}`);
      console.log(`Private Key: ${certFiles.keyPath}`);
    } catch (error) {
      console.error('Error creating certificate:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
