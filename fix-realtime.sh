#!/bin/bash

# Fix realtime subscription in chat page

FILE="app/home/chat/page.tsx"

# Add check for admin channel and console logs
sed -i '361a\        if (!activeChannel || activeChannel === '\''admin'\'') return;\n        console.log('\''🔔 Setting up realtime for:'\'', activeChannel);' "$FILE"

# Add console log for new messages
sed -i '372a\                    console.log('\''📨 New realtime message:'\'', payload.new);' "$FILE"

# Add console log after adding message
sed -i '387a\                    console.log('\''✅ Message added to state'\'');' "$FILE"

# Add subscription status logging
sed -i 's/.subscribe();/.subscribe((status) => console.log('\''📡 Subscription status:'\'', status));/' "$FILE"

echo "✅ Added realtime debugging logs"
