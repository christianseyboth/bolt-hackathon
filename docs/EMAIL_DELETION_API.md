# n8n Email Deletion API (POP3)

This API endpoint allows you to **permanently delete** emails from your mailbox after analysis in
n8n workflows using POP3 protocol.

## Endpoint

```
POST /api/delete-email
```

## Authentication

**🔒 SECURITY: This endpoint uses a dedicated environment variable API key!**

The API key is stored as an environment variable `N8N_API_KEY` in Netlify and is only accessible to
your n8n workflows.

## Setup

### 1. Generate API Key

Generate a secure API key for n8n:

```bash
# Generate a random 32-character API key
openssl rand -hex 16
```

Or use this online generator: https://generate-secret.vercel.app/32

### 2. Add to Netlify Environment Variables

1. Go to your Netlify dashboard
2. Navigate to Site settings → Environment variables
3. Add a new variable:
    - **Key**: `N8N_API_KEY`
    - **Value**: Your generated API key (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### 3. Redeploy

After adding the environment variable, redeploy your site to make it available.

## Usage in n8n

Add an **HTTP Request** node to your n8n workflow after email analysis:

### Configuration

```json
{
    "method": "POST",
    "url": "https://your-secpilot-domain.com/api/delete-email",
    "headers": {
        "Authorization": "Bearer YOUR_N8N_API_KEY",
        "Content-Type": "application/json"
    },
    "body": {
        "messageId": "{{$json.messageId}}",
        "host": "mail.yourdomain.com",
        "user": "your-email@yourdomain.com",
        "password": "your-email-password",
        "port": 110
    }
}
```

### Netcup.com Settings

For netcup hosted mailboxes, use these typical settings:

-   **Host**: `mail.yourdomain.com` or `imap.yourdomain.com`
-   **Port**: `110` (POP3 non-SSL) or `995` (POP3 SSL)
-   **User**: Your full email address
-   **Password**: Your email password

### Response

**Success:**

```json
{
    "success": true,
    "deleted": true,
    "messageId": "<example@domain.com>",
    "emailsFound": 1,
    "message": "Email permanently deleted",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "source": "n8n-pop3"
}
```

**Authentication Error:**

```json
{
    "error": "Invalid API key",
    "status": 401
}
```

**Configuration Error:**

```json
{
    "error": "API not configured",
    "status": 500
}
```

## n8n Workflow Example

1. **Email Analysis Node** (your existing analysis)
2. **HTTP Request Node** (call delete API with n8n API key)
3. **Optional: Update Database** (mark as deleted in mail_events)

### Example Workflow

```
Email Analysis → HTTP Request (Delete) → Database Update
```

## Testing

You can test the API by visiting (requires n8n API key):

```
GET https://your-secpilot-domain.com/api/delete-email
```

Include your n8n API key in the Authorization header:

```
Authorization: Bearer YOUR_N8N_API_KEY
```

This will return API documentation and example usage.

## Security Features

-   ✅ **Environment Variable Security**: API key stored securely in Netlify environment variables
-   ✅ **Dedicated Access**: Only accessible to your n8n workflows
-   ✅ **No Account Dependencies**: No need for user accounts or database lookups
-   ✅ **Simple Validation**: Direct string comparison for fast authentication
-   ✅ **Audit Logging**: All operations logged with `[n8n-pop3]` prefix
-   ✅ **Input Validation**: All required fields are validated
-   ✅ **Permanent Deletion**: Uses POP3 for true email removal

## Advantages of POP3 Implementation

1. **True Deletion**: Emails are permanently removed from the server
2. **No Trash Folder**: No need to worry about emails moving to trash
3. **Immediate Effect**: Deletion happens instantly
4. **Simpler Protocol**: POP3 is more straightforward than IMAP
5. **No Expunge Needed**: Direct deletion without additional steps

## POP3 Ports

-   **Port 110**: POP3 (non-SSL) - Standard POP3
-   **Port 995**: POP3 (SSL) - Secure POP3

## How It Works

1. **Connect**: Establishes POP3 connection to your mail server
2. **Authenticate**: Logs in with your credentials
3. **Search**: Scans through all emails to find matching Message-ID
4. **Delete**: Permanently removes the email using POP3 DELE command
5. **Verify**: Confirms deletion was successful
6. **Disconnect**: Safely closes the connection

## Troubleshooting

1. **401 Unauthorized**: Check your N8N_API_KEY environment variable is set correctly
2. **500 API not configured**: Ensure N8N_API_KEY is set in Netlify environment variables
3. **Connection failed**: Check host, port, and credentials
4. **Email not found**: Verify Message-ID format and email exists
5. **Permission denied**: Check email account permissions
6. **Timeout**: Increase connection timeout if needed

## Environment Variable Setup

### Netlify CLI (Alternative)

If you prefer using Netlify CLI:

```bash
# Set environment variable
netlify env:set N8N_API_KEY "your-generated-api-key"

# Deploy
netlify deploy --prod
```

### Local Development

For local testing, add to your `.env.local`:

```
N8N_API_KEY=your-generated-api-key
```

## Important Notes

⚠️ **WARNING**: This API permanently deletes emails using POP3. Deleted emails cannot be recovered!

-   Emails are permanently removed from the server
-   No backup or trash folder is used
-   Make sure you have proper backups if needed
-   Test with non-critical emails first
