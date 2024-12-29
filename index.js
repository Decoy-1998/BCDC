//test hook: "https://discord.com/api/webhooks/1322919292659957815/H3ZLyNwPgtosxfJrmvj4Nf3Hrn5f8C1nmjPDLnR--dZUISV1cBcXa48VuPi6vfCxgxAd"; // Fill in your webhook URL here
const webhookUrl = "https://discord.com/api/webhooks/1322930663141408870/zjPkW3hQPsWFkZ0VcpIWDxkes_BZ7aDpjl2098CA2ZTfCPHZq-jgr1Hfz4pv4bn2_jsH";
const allowedPlayerId = 187699; // Replace with the allowed player's ID

function initializeScript() {
    ChatRoomRegisterMessageHandler({
        Description: "Checks for all messages and responds to specific members",
        Priority: 100000,
        Callback: (data, sender, msg, metadata) => {
            if (data?.Sender == 187699) return; // Ignore messages from this sender
            if (metadata?.SourceCharacter?.MemberNumber !== metadata?.TargetCharacter?.MemberNumber) return;

            // Filter out @, <, and > symbols from the message
            const filteredMsg = msg.replace(/[@<>]/g, '');

            const response = `${metadata.senderName} - ${data.Sender}: ${filteredMsg}`; // response message
            sendToWebhook(response); // send response to Discord webhook
        }
    });

    ChatRoomRegisterMessageHandler({
        Description: "Log all server messages",
        Priority: 0,
        Callback: (data, sender, msg, metadata) => {
            console.log(`Received message of type: ${data.Type}`, data);
            if (data.Type === "Action" && ["ServerEnter", "ServerLeave", "ServerDisconnect", "ServerBan", "ServerKick"].some(m => data.Content.startsWith(m))) {
                console.log(`Enter/Leave message: ${data.Content}`);
                let action;
                if (data.Content.startsWith("ServerEnter")) {
                    action = "entered";
                } else if (data.Content.startsWith("ServerLeave")) {
                    action = "left";
                } else if (data.Content.startsWith("ServerDisconnect")) {
                    action = "disconnected from";
                } else if (data.Content.startsWith("ServerBan")) {
                    action = "was banned from";
                } else if (data.Content.startsWith("ServerKick")) {
                    action = "was kicked from";
                }
                const message = `${metadata.senderName} ${action} the Kitty Palace`;
                sendToWebhook(message);
            }
            return false;
        }
    });

    function sendToWebhook(message) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", webhookUrl, true); // Ensure webhookUrl is defined
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ content: message }));

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('Message sent to webhook successfully');
            } else {
                console.error('Error sending message to webhook:', xhr.statusText);
            }
        };
    }
}

// Check if the script is loaded by the allowed player
if (Player.MemberNumber === allowedPlayerId) {
    initializeScript();
}
