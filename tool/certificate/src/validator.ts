import * as fs from 'fs';
import * as path from 'path';

export function validateCA(caDir: string): boolean {
  const caCertPath = path.join(caDir, 'root-certificate-authority.crt');
  const caKeyPath = path.join(caDir, 'root-certificate-authority.key');
  return fs.existsSync(caCertPath) && fs.existsSync(caKeyPath);
}
