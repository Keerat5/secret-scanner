const patterns = [

{ name:"Password", regex:/password\s*[:=]\s*.+/gi },

{ name:"AWS Access Key", regex:/AKIA[0-9A-Z]{16}/g },

{ name:"GitHub Token", regex:/ghp_[A-Za-z0-9]{36}/g },

{ name:"OpenAI Key", regex:/sk-proj-[A-Za-z0-9_-]{20,}/g },

{ name:"Stripe Secret", regex:/sk_live_[A-Za-z0-9]{24,}/g },

{ name:"Stripe Publishable", regex:/pk_live_[A-Za-z0-9]{24,}/g },

{ name:"Bearer Token", regex:/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g },

{ name:"JWT", regex:/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },

{ name:"MongoDB URI", regex:/mongodb(\+srv)?:\/\/[^\s'"]+/g },

{ name:"Firebase Key", regex:/AIza[0-9A-Za-z\-_]{35}/g },

{ name:"Slack Token", regex:/xox[baprs]-[A-Za-z0-9-]+/g },

{ name:"Google API Key", regex:/AIza[0-9A-Za-z\-_]{35}/g },

{ name:"Private Key", regex:/-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----/g },

{ name:"Discord Token", regex:/[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/g },

{ name:"Generic API Key", regex:/api[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9_\-]{16,}['"]?/gi }

];

export default patterns;