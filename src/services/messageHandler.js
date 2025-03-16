import whatsappService from './whatsappService.js';
import appendToSheet from './googleSheetsService.js';

class MessageHandler {

    constructor() {
        this.appointmentState = {};
    }

    async handleIncomingMessage(message, senderInfo) {
        if (message?.type === 'text') {

            const incomingMessage = message.text.body.toLowerCase().trim();

            const messageParts = incomingMessage.split(':');

            if (this.isGretting(incomingMessage)) {
                await this.sendWelcomeMessage(message.from, message.id, senderInfo);
                await this.sendWelcomeMenu(message.from);
            } else if (messageParts[0] == 'media') {
                if (!messageParts[1]) {
                    const response = 'Por favor, envía el tipo de archivo que deseas recibir: image, audio, video, document';
                    await whatsappService.sendMessage(message.from, response, message.id);
                }
                await this.sendMedia(message.from, message.id, messageParts[1]);
            } else if (this.appointmentState[message.from]) {
                await this.handleAppointmentFlow(message.from, incomingMessage);
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
            case 'welcomeMenuOp1': // Agendar
                // message = '¡Genial! ¿Qué día te gustaría agendar tu cita?';
                // await this.sendAppointmentMenu(to);
                this.appointmentState[to] = { step: 'name' };
                message = 'Por favor dime, ¿Cuál es tu nombre? 🤗';
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

    async sendMedia(to, messageId, type) {
        let mediaUrl = '';
        switch (type) {
            case 'image':
                mediaUrl = 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg';
                break;
            case 'audio':
                mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
                break;
            case 'video':
                mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
                break;
            case 'document':
                mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
                break
            default:
                throw new Error('Tipo de archivo no soportado');
                break;
        }
        await whatsappService.sendMediaMessage(to, mediaUrl, type, messageId, `${type} ejemplo`);
    }

    completeAppointment(to) {
        const appointment = this.appointmentState[to];
        delete this.appointmentState[to];

        const data = [
            to,
            appointment.name,
            appointment.petName,
            appointment.petType,
            appointment.reason,
            new Date().toISOString()
        ]
        appendToSheet(data);
        return `
Los datos de tu cita son: 
    - Nombre: ${appointment.name}
    - Mascota: ${appointment.petName}
    - Tipo: ${appointment.petType}
    - Motivo: ${appointment.reason}
Gracias por confiar en PuppyMed 😉
Nos pondremos en contacto contigo para confirmar la fecha y hora de la cita 🐾
        `;

    }

    async handleAppointmentFlow(to, message) {
        const state = this.appointmentState[to];
        let response;

        switch (state.step) {
            case 'name':
                state.name = message;
                state.step = 'petName';
                response = '¿Cuál es el nombre de tu mascota?';
                break;
            case 'petName':
                state.petName = message;
                state.step = 'petType';
                response = '¿Qué tipo de mascota es? 🐶, 🐱, ...';
                break;
            case 'petType':
                state.petType = message;
                state.step = 'reason';
                response = '¿Cuál es el motivo de la consulta?';
                break;
            case 'reason':
                state.reason = message;
                
                response = this.completeAppointment(to);
                break;
        }
        await whatsappService.sendMessage(to, response)
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