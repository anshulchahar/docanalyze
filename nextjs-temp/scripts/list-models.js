// Script to list all available Gemini models using direct API calls
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    try {
        // Get API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Error: Missing GEMINI_API_KEY in environment variables');
            console.log('Make sure you have a .env.local file with GEMINI_API_KEY=your_api_key_here');
            process.exit(1);
        }

        console.log('Attempting to list available Gemini models...');

        // Try multiple API versions
        const apiVersions = ['v1', 'v1beta', 'v1beta2', 'v1beta3'];
        let successfulResponse = null;
        let lastError = null;

        // Try each API version until one works
        for (const version of apiVersions) {
            try {
                console.log(`Trying API version: ${version}`);
                const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;

                const response = await fetch(url, { method: 'GET' });

                if (response.ok) {
                    const data = await response.json();
                    successfulResponse = { version, data };
                    console.log(`✓ Success with API version: ${version}`);
                    break;
                } else {
                    const errorText = await response.text();
                    console.log(`✗ Failed with API version ${version}: ${response.status} ${errorText}`);
                    lastError = { version, status: response.status, text: errorText };
                }
            } catch (error) {
                console.log(`✗ Error with API version ${version}:`, error.message);
                lastError = { version, error };
            }
        }

        if (successfulResponse) {
            const { version, data } = successfulResponse;

            // Display results in a formatted way
            console.log(`\n=== AVAILABLE MODELS (API version: ${version}) ===\n`);

            if (data.models && data.models.length) {
                data.models.forEach((model, index) => {
                    console.log(`Model ${index + 1}: ${model.name}`);
                    console.log(`  Display Name: ${model.displayName || 'N/A'}`);
                    console.log(`  Description: ${model.description || 'N/A'}`);
                    console.log(`  Version: ${model.version || 'N/A'}`);

                    if (model.supportedGenerationMethods) {
                        console.log(`  Supported Methods:`);
                        model.supportedGenerationMethods.forEach(method => {
                            console.log(`    - ${method}`);
                        });
                    }

                    console.log(`  Input Token Limit: ${model.inputTokenLimit || 'N/A'}`);
                    console.log(`  Output Token Limit: ${model.outputTokenLimit || 'N/A'}`);
                    console.log('');
                });

                // Print a summary of model names for easy reference
                console.log('\n=== MODEL NAME SUMMARY ===');
                data.models.forEach(model => {
                    // Extract the model name part after models/
                    const shortName = model.name.split('models/')[1] || model.name;
                    console.log(`- ${shortName}`);
                });
            } else {
                console.log('No models returned from the API');
            }

            // Print full raw API response for additional details
            console.log('\n=== RAW API RESPONSE ===');
            console.log(JSON.stringify(data, null, 2));

        } else {
            console.error('Failed to list models with all API versions');
            if (lastError) {
                console.error('Last error:', lastError);
            }
        }

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

// Execute the function
listModels();