const crypto = window.crypto.subtle;

const urlParams = new URLSearchParams(window.location.search)

const username = decodeURI(urlParams.get("username"));
const iss = decodeURI(urlParams.get("guest_issuer_id"))
const secret = decodeURI(urlParams.get("guest_issuer_secret"))
const meetingUrl = decodeURI(urlParams.get("meeting_url"))

async function main() {
// Generate and use guest tokes:
//  * https://developer.webex.com/docs/guest-issuer#generating-guest-tokens
//  * https://stackoverflow.com/questions/67432096/generating-jwt-tokens
    const guestJwtHeader = JSON.stringify({
        "typ": "JWT",
        "alg": "HS256"
    });
    console.log(guestJwtHeader);
    const guestJwtPayload = JSON.stringify({
        "sub": `guest-user-${Math.floor(Math.random() * 1_000_000_000_000)}`,
        "name": username,
        "iss": iss,
        // Guest token should expire in 2 hours
        "exp": Math.floor(Date.now() / 1000) + 2 * 60 * 60
    });
    console.log(guestJwtPayload);

    const base64EncodedData = `${utf8_to_b64(guestJwtHeader)}.${utf8_to_b64(guestJwtPayload)}`
    const textEncoder = new TextEncoder()

// HMACs require a key for signing: create a suitable key for the HMAC-SHA-256 algorithm
    const hmacKey = await crypto.importKey(
        "raw",
        b64_string_to_uint8array(secret),
        {
            name: "HMAC",
            hash: {
                name: "SHA-256"
            },
        },
        false,
        ["sign"]
    );


    const guestJwtSignature = await crypto.sign("HMAC", hmacKey, textEncoder.encode(base64EncodedData));
    const guestJwtSignatureString = b64_uint8array_to_string(new Uint8Array(guestJwtSignature));
    console.log(guestJwtSignatureString);
    const guestJwt = `${base64EncodedData}.${guestJwtSignatureString}`;

    const webex = window.Webex.init();

    webex.once(`ready`, async () => {
        await webex.authorization.requestAccessTokenFromJwt({jwt: guestJwt});

        // the user is now authenticated with a guest token (JWT)

        // register as device
        await webex.meetings.register()
            .catch((err) => {
                console.error(err);
                alert(err);
                throw err;
            });

        // create meeting object
        const meeting = await webex.meetings.create(meetingUrl);

        // report errors to console
        meeting.on('error', (err) => {
            console.error(err);
        });

        // join meeting
        await meeting.join();
        document.getElementById('username').innerText = username;
        console.log(`joined meeting ${meeting} as ${username}`);
        // we're done here and should show up as a fake user

        // enable hangup button

        const button = document.getElementById('hangup');
        button.disabled = false;
        button.addEventListener('click', () => {
            meeting.leave();
            button.disabled = true;
        });

        // Hopefully IdrA won't gg
    })
}

function utf8_to_b64(str) {
    return strip_trailing_equals_sign(window.btoa(unescape(encodeURIComponent(str))))
}

function strip_trailing_equals_sign(base64) {
    if (base64[base64.length - 1] === "=") {
        return base64.slice(0, base64.length - 1)
    }
    return base64
}

function b64_uint8array_to_string(base64) {
    var base64string = btoa(String.fromCharCode(...base64));
    return base64string.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64_string_to_uint8array(base64) {
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    return new Uint8Array(Array.prototype.map.call(atob(base64), function (c) { return c.charCodeAt(0); }));
}
