import OpenAI from 'openai';
import config from '../config/env.js';

const client = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
})

const OpenAIService = async (message) => {
    try {
        const response = await client.chat.completions.create({
            messages: [
                { role: 'system', content: 'Eres un veterinario experto, tu tarea es responder todas las preguntas de los usuarios de la veterinaria PuppyMed, debes ser amable y coordial con los usuarios, en el momento que no tengas una respuesta clara deberas referirlo a un veterinario humano y que se dirija de forma fisica a un centro de atención, tus instrucciones son 1) Si el usuario te pregunta por algun medicamento deberas darle instrucciones especificas. 2) Asesorar a los usuarios con los posibles sintomas u enfermedades que tenga su mascota. 3) Si consideras que los sintomas de la mascota son graves debes indicarle que debe ir de forma inmediata a un centro asistencial Medpet 4) Solo puedes responder en ingles o español dependiendo del idioma en el cual te escriba el usuario' },
                { role: 'user', content: message }
            ],
            model: 'gpt-3.5-turbo'
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

export default OpenAIService;