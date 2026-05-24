export interface CompatibilityResult {
  isCompatible: boolean;
  isEsimCapable: boolean;
  isLocked: boolean;
  brand: string;
  model: string;
  readiness: 'esim_ready' | 'physical_ready' | 'locked' | 'unsupported';
  message: string;
}

export const compatibilityService = {
  validateImei(imei: string): boolean {
    // Strip formatting characters
    const cleanImei = imei.replace(/\D/g, '');
    
    // Standard IMEI is exactly 15 digits
    if (cleanImei.length !== 15) {
      return false;
    }
    
    // Optional Luhn algorithm check for realistic validation
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let d = parseInt(cleanImei[i], 10);
      if (i % 2 !== 0) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return sum % 10 === 0;
  },

  checkCompatibility(imei: string): Promise<CompatibilityResult> {
    return new Promise((resolve) => {
      // Simulate network spectrum and IMEI registry query delay (realistic & modern)
      setTimeout(() => {
        const clean = imei.replace(/\D/g, '');
        
        // Brand heuristics based on standard Type Allocation Code (TAC) prefixes
        let brand = 'Android Device';
        let model = '5G Handset';
        
        if (clean.startsWith('35')) {
          brand = 'Apple';
          const digit = parseInt(clean.charAt(2), 10);
          if (digit % 3 === 0) model = 'iPhone 15 Pro';
          else if (digit % 3 === 1) model = 'iPhone 14';
          else model = 'iPhone 13 mini';
        } else if (clean.startsWith('99')) {
          brand = 'Google';
          model = 'Pixel 8 Pro';
        } else if (clean.startsWith('50')) {
          brand = 'Nothing';
          model = 'Phone (2)';
        } else if (clean.startsWith('353')) {
          brand = 'Samsung';
          model = 'Galaxy S24 Ultra';
        }

        // Suffix Rules for Dev/QA Testing
        const isUnsupported = clean.endsWith('00');
        const isLocked = clean.endsWith('99');
        const isEsimOnly = clean.endsWith('11');

        if (isUnsupported) {
          resolve({
            isCompatible: false,
            isEsimCapable: false,
            isLocked: false,
            brand,
            model,
            readiness: 'unsupported',
            message: `This device doesn't support our high-speed 5G bands. Most modern phones work fine. We'd love to help you find a new device, or you can test another phone.`
          });
        } else if (isLocked) {
          resolve({
            isCompatible: true,
            isEsimCapable: true,
            isLocked: true,
            brand,
            model,
            readiness: 'locked',
            message: `Your ${brand} ${model} is compatible, but it is currently locked to your current carrier. Most carriers will unlock it for free if you request it online or call them. Once unlocked, you can join instantly.`
          });
        } else if (isEsimOnly || clean.startsWith('35') || clean.startsWith('99')) {
          // Flag brand new eSIM devices
          resolve({
            isCompatible: true,
            isEsimCapable: true,
            isLocked: false,
            brand,
            model,
            readiness: 'esim_ready',
            message: `Your ${brand} ${model} plays perfectly with our network. Since it supports eSIM, you can activate your service immediately—no plastic garbage or fluorescent carrier store trips required.`
          });
        } else {
          // Physical SIM fallback
          resolve({
            isCompatible: true,
            isEsimCapable: false,
            isLocked: false,
            brand,
            model,
            readiness: 'physical_ready',
            message: `Your ${brand} ${model} is fully compatible. It requires a physical SIM card, which we'll ship overnight. Most unlocked devices work fine. We'll check again before we activate.`
          });
        }
      }, 1500);
    });
  }
};
