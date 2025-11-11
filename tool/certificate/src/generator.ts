import * as fs from 'fs';
import * as path from 'path';
import forge from 'node-forge';
import { CACreateOptions, CertCreateOptions, CAFiles, CertFiles } from './types.js';

export async function createCA(options: CACreateOptions): Promise<CAFiles> {
  const caDir = path.resolve(options.dir);
  if (!fs.existsSync(caDir)) {
    fs.mkdirSync(caDir, { recursive: true });
  }

  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + (options.validityDays || 3650));

  const attrs = [
    { name: 'commonName', value: options.commonName || 'tw050x.dev Local Development CA' },
    { name: 'countryName', value: options.countryName || 'US' },
    { shortName: 'ST', value: options.stateName || 'State' },
    { name: 'localityName', value: options.localityName || 'City' },
    { name: 'organizationName', value: options.organizationName || 'tw050x.dev' },
    { shortName: 'OU', value: options.organizationalUnitName || 'Development' }
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
    { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true, clientAuth: true, codeSigning: true, emailProtection: true, timeStamping: true },
    { name: 'nsCertType', sslCA: true, emailCA: true, objCA: true },
    { name: 'subjectKeyIdentifier' }
  ]);

  cert.sign(keys.privateKey, forge.md.sha256.create());

  const pem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

  const certPath = path.join(caDir, 'root-certificate-authority.crt');
  const keyPath = path.join(caDir, 'root-certificate-authority.key');

  fs.writeFileSync(certPath, pem);
  fs.writeFileSync(keyPath, keyPem);

  return { certPath, keyPath };
}

export async function createCert(options: CertCreateOptions): Promise<CertFiles> {
  const caCertPath = path.join(options.caDir, 'root-certificate-authority.crt');
  const caKeyPath = path.join(options.caDir, 'root-certificate-authority.key');

  if (!fs.existsSync(caCertPath) || !fs.existsSync(caKeyPath)) {
    throw new Error('Root certificate authority not found. Please generate it first.');
  }

  const caCertPem = fs.readFileSync(caCertPath, 'utf8');
  const caKeyPem = fs.readFileSync(caKeyPath, 'utf8');
  const caCert = forge.pki.certificateFromPem(caCertPem);
  const caKey = forge.pki.privateKeyFromPem(caKeyPem);

  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '02';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + (options.validityDays || 365));

  const domains = options.domains || [];

  const attrs = [
    { name: 'commonName', value: domains[0] || options.name },
    { name: 'countryName', value: 'US' },
    { shortName: 'ST', value: 'State' },
    { name: 'localityName', value: 'City' },
    { name: 'organizationName', value: 'tw050x.dev' },
    { shortName: 'OU', value: 'Development' }
  ];

  cert.setSubject(attrs);
  cert.setIssuer(caCert.subject.attributes);

  const extensions = [
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true, clientAuth: true },
    { name: 'authorityKeyIdentifier', keyIdentifier: caCert.generateSubjectKeyIdentifier().getBytes() }
  ];

  if (domains.length > 0) {
    const altNames = domains.map((domain, index) => ({ type: 2, value: domain }));
    extensions.push({ name: 'subjectAltName', altNames } as any);
  }

  cert.setExtensions(extensions);

  cert.sign(caKey, forge.md.sha256.create());

  const pem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

  const certDir = path.resolve(options.certDir);
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const certPath = path.join(certDir, `${options.name}.crt`);
  const keyPath = path.join(certDir, `${options.name}.key`);

  fs.writeFileSync(certPath, pem);
  fs.writeFileSync(keyPath, keyPem);

  return { certPath, keyPath };
}
