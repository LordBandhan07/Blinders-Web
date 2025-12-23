// Script to generate password hashes for default Blinders users
// Run with: node scripts/generate-hashes.js

const bcrypt = require('bcryptjs');

const users = [
    {
        email: 'arthur.b@blinders.chief',
        password: 'LordBandhan@Blinders07',
        name: 'Arthur Shelby - God of Blinders',
        role: 'god'
    },
    {
        email: 'steve.s@blinders.president',
        password: 'MrSteve@Blinders7',
        name: 'Steve Rogers - President',
        role: 'president'
    },
    {
        email: 'robert.s@blinders.chiefmember',
        password: 'MrRobert@Blinders7',
        name: 'Robert Downey - Chief Member',
        role: 'chief_member'
    },
    {
        email: 'anthoni.b@blinders.seniormember',
        password: 'MrAnthony@Blinders7',
        name: 'Anthony Mackie - Senior Member',
        role: 'senior_member'
    }
];

console.log('-- Insert default Blinders users');
console.log('-- Copy and paste this into Supabase SQL Editor\n');

users.forEach(user => {
    const hash = bcrypt.hashSync(user.password, 10);
    const canChangeEmail = user.role === 'god' ? 'true' : 'false';

    console.log(`INSERT INTO blinders_users (email, password_hash, display_name, role, can_change_email) VALUES`);
    console.log(`('${user.email}', '${hash}', '${user.name}', '${user.role}', ${canChangeEmail});`);
    console.log('');
});

console.log('\n-- Done! Copy the INSERT statements above into Supabase.');
