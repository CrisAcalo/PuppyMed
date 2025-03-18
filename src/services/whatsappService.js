import sendToWhatsApp from "./httpRequest/sendToWhatsapp.js";

class WhatsAppService {

    async sendMessage(to, body, messageId) {
        const data = {
            messaging_product: 'whatsapp',
            to,
            text: { body },
            // context: {
            //     message_id: messageId,
            // },
        }

        await sendToWhatsApp(data);
    }

    async markAsRead(messageId) {
        const data = {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        }

        await sendToWhatsApp(data);
    }

    async sendInteractiveButtons(to, buttons, message) {
        const data = {
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: message,
                },
                action: {
                    buttons,
                }
            }
        }

        await sendToWhatsApp(data);
    }

    async sendMediaMessage(to, mediaUrl, mediaType, messageId, caption) {
        const mediaObject = {};
        switch (mediaType) {
            case 'image':
                mediaObject.image = {
                    link: mediaUrl,
                    caption: caption
                };
                break;
            case 'audio':
                mediaObject.audio = {
                    link: mediaUrl
                };
                break;
            case 'video':
                mediaObject.video = {
                    link: mediaUrl,
                    caption: caption
                };
                break;
            case 'document':
                mediaObject.document = {
                    link: mediaUrl,
                    caption: caption,
                    filename: 'puppyMed.pdf'
                };
                break;
            default:
                throw new Error('Invalid media type');
                break;
        }

        const data = {
            messaging_product: 'whatsapp',
            to,
            type: mediaType,
            ...mediaObject,
            context: {
                message_id: messageId,
            },
        }

        await sendToWhatsApp(data);
    }

    async sendContactMessage(to, contact) {
        const data = {
            messaging_product: 'whatsapp',
            to,
            type: 'contacts',
            contacts: [contact],
        };

        await sendToWhatsApp(data);
    }

    async sendLocationMessage(to, latitude, longitude, name, address) {

        const data = {
            messaging_product: 'whatsapp',
            to,
            type: 'location',
            location: {
                latitude,
                longitude,
                name,
                address,
            },
        };

        await sendToWhatsApp(data);
    }
}

export default new WhatsAppService();