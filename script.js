document.addEventListener('DOMContentLoaded', () => {
    const drugForm = document.getElementById('drug-form');
    const drugNameInput = document.getElementById('drug-name');
    const opeDayInput = document.getElementById('ope-day');
    const resultContainer = document.getElementById('result-container');
    const checkButton = document.getElementById('check-button');

    drugForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Form submission triggered.');

        const drugName = drugNameInput.value;
        const opeDay = opeDayInput.value;

        if (!drugName || !opeDay) {
            alert('薬剤名と手術日を入力してください。');
            return;
        }

        console.log(`Input Drug Name: ${drugName}`);
        console.log(`Input Ope Day: ${opeDay}`);

        // Dify API endpoint and Authorization
        const difyUrl = '/api/dify';
        const apiRequestBody = {
            "inputs": {
                "drag_name": drugName,
                "ope_day": opeDay.replace(/-/g, '/') // Format date to YYYY/MM/DD
            },
            "response_mode": "blocking",
            "user": "gemini-test-user"
        };

        console.log('Sending data to Dify:', JSON.stringify(apiRequestBody, null, 2));

        // Show loading message
        resultContainer.innerHTML = '<p>Difyに確認中...</p>';
        checkButton.disabled = true;

        try {
            const response = await fetch(difyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiRequestBody)
            });

            console.log('Received response from Dify. Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Dify response data:', JSON.stringify(result, null, 2));

            // Difyのワークフローのレスポンス形式に合わせて、textプロパティを取得
            // 一般的な形式は `result.data.outputs.text` や `result.outputs.text` です
            // 今回のAPI仕様に基づき、`result.text` を直接参照します
            const resultText = result.text || result.outputs?.text || result.data?.outputs?.text;

            if (resultText) {
                // 結果を改行で分割してリスト表示する
                const lines = resultText.trim().split('\n');
                const listHtml = '<ul>' + lines.map(line => `<li>${line}</li>`).join('') + '</ul>';
                resultContainer.innerHTML = listHtml;
            } else {
                resultContainer.innerHTML = '<p>結果を取得できませんでした。</p>';
                console.log('No text found in Dify response.');
            }

        } catch (error) {
            console.error('An error occurred:', error);
            resultContainer.innerHTML = `<p>エラーが発生しました。詳細はコンソールを確認してください。</p><p style="color:red;">${error.message}</p>`;
        } finally {
            checkButton.disabled = false;
        }
    });
});