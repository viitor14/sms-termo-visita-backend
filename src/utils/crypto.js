import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const PREFIX = 'enc:';

// Helper para obter a chave (precisa ter 32 bytes para aes-256)
const getSecretKey = () => {
  const secret = process.env.SIGNATURE_SECRET || 'senha_padrao_insegura_mudar_agora!';
  // Faz um hash da chave para garantir exatamente 32 bytes (256 bits)
  return crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32);
};

export const encryptString = (text) => {
  if (!text) return text;
  if (text.startsWith(PREFIX)) return text; // Já está criptografado

  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getSecretKey()), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Retorna o iv + o texto encriptado, juntos no formato iv:texto em hexadecimal
    return `${PREFIX}${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    console.error('Erro ao criptografar assinatura:', error);
    return text;
  }
};

export const decryptString = (text) => {
  if (!text) return text;
  if (!text.startsWith(PREFIX)) return text; // Não está criptografado, retorna o texto puro (compatibilidade)

  try {
    const textParts = text.substring(PREFIX.length).split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getSecretKey()), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Erro ao descriptografar assinatura:', error);
    return text; // Em caso de falha (ex: chave mudou), retorna o dado cru ou string vazia.
  }
};
