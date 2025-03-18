import path from 'path';
import { google } from 'googleapis';
import config from '../config/env.js';

const sheets = google.sheets('v4');

async function addRowToSheet(auth, spreadsheetId, values) {
    const request = {
        spreadsheetId,
        range: 'reservas',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [values]
        },
        auth,
    }

    try {
        const response = (await sheets.spreadsheets.values.append(request).data);
        return response;
    } catch (error) {
        console.error(error);
    }
}

const appendToSheet = async (data) => {
    try {
        const credentials = JSON.parse(config.GOOGLE_CREDENTIALS);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const authClient = await auth.getClient();
        const spreadSheetId = '18jvrWR1KMX-oSv9w8VHgcyg2nUrDKKXd1masmgFe2Pw';

        await addRowToSheet(authClient, spreadSheetId, data);
        return 'Datos correctamente añadidos';
    } catch (error) {
        console.error(error);
    }
}

export default appendToSheet;