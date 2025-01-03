import whatsappService from './whatsappService.js';

class MessageHandler {

    async handleIncomingMessage(message, senderInfo) {
        if (message?.type === 'text') {

            const incomingMessage = message.text.body.toLowerCase().trim();
            if (this.isGretting(incomingMessage)) {
                await this.sendWelcomeMessage(message.from, message.id, senderInfo);
                await this.sendWelcomeMenu(message.from);
            } else if (incomingMessage == 'media') {
                await this.sendMedia(message.from, message.id);
            } else {
                const response = `Echo: ${message.text.body}`;
                await whatsappService.sendMessage(message.from, response, message.id);
            }
            await whatsappService.markAsRead(message.id);
        } else if (message?.type === 'interactive') {
            const titleOption = message.interactive?.button_reply?.title.toLowerCase().trim();
            const idOption = message.interactive?.button_reply?.id;

            await this.handleWelcomeMenu(message.from, titleOption, idOption);
            await whatsappService.markAsRead(message.id);
        }
    }

    async sendWelcomeMessage(to, messageId, senderInfo) {
        const name = this.senderName(senderInfo);
        const message = `Hola, ${name} Bienvenido a la veterinaria PuppyMed 🐶🐱`;
        await whatsappService.sendMessage(to, message, messageId);
    }

    async sendWelcomeMenu(to) {
        const message = '¿Qué te gustaría hacer hoy? 🐾';
        const buttons = [
            {
                type: "reply",
                reply: {
                    id: "welcomeMenuOp1",
                    title: "Agendar cita"
                }
            },
            {
                type: "reply",
                reply: {
                    id: "welcomeMenuOp2",
                    title: "Consultar servicios"
                }
            },
            {
                type: "reply",
                reply: {
                    id: "welcomeMenuOp3",
                    title: "Agencias"
                }
            }
        ];
        await whatsappService.sendInteractiveButtons(to, buttons, message);
    }

    async handleWelcomeMenu(to, titleOption, idOption) {
        let message = '';
        switch (idOption) {
            case 'welcomeMenuOp1':
                message = '¡Genial! ¿Qué día te gustaría agendar tu cita?';
                // await this.sendAppointmentMenu(to);
                break;
            case 'welcomeMenuOp2':
                message = '¡Claro! Aquí tienes nuestros servicios 🐾';
                // await this.sendServicesMenu(to);
                break;
            case 'welcomeMenuOp3':
                message = '¡Claro! Aquí tienes nuestras agencias 🐾';
                // await this.sendAgenciesMenu(to);
                break;
            default:
                message = '¡Ups! No entendí tu mensaje 😅';
                // await this.sendDefaultMessage(to);
                break;
        }
        await whatsappService.sendMessage(to, message);
    }

    async sendMedia(to, messageId) {
        // const mediaUrl = 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg';
        // const mediaType = 'image';
        // const caption = 'Imagen ejemplo';

        // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
        // const mediaType = 'audio';
        // const caption = 'Audio ejemplo';

        // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
        // const mediaType = 'video';
        // const caption = 'Video ejemplo';

        const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
        const mediaType = 'document';
        const caption = 'Documento ejemplo';

        await whatsappService.sendMediaMessage(to, mediaUrl, mediaType, messageId, caption);
    }

    isGretting(message) {
        const grettings = ['hi', 'hello', 'hola', 'hey', 'saludos',
            'buenos días', 'buenas tardes', 'buenas noches',
            'good morning', 'good afternoon', 'good night', 'greetings', 'good day', 'good evening'
        ];
        return grettings.includes(message);
    }

    senderName(senderInfo) {
        const name = senderInfo?.profile?.name || senderInfo?.wa_id;
        return name.split(' ')[0];
    }
}

export default new MessageHandler();