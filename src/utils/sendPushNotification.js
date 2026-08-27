import axios from 'axios';
import PushToken from '../models/PushToken';

export default async function sendPushNotification(title, body, data = {}) {
  try {
    const tokens = await PushToken.findAll();
    if (tokens.length === 0) return;

    const messages = tokens.map((tokenRecord) => ({
      to: tokenRecord.token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default'
    }));

    // Divisão em blocos de no máximo 100 mensagens conforme recomendação da Expo API
    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      const response = await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });
      console.log('Expo API Response:', JSON.stringify(response.data));
    }

    console.log(`Push notifications enviadas para ${tokens.length} dispositivos.`);
  } catch (error) {
    console.error('Erro ao enviar push notification:', error);
  }
}
