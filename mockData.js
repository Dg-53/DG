// Mock data for simulating battery readings
const mockData = {
    readings: [],
    settings: {
        min_voltage: 11.5,
        max_voltage: 14.5,
        gsm_number: "+966500000000"
    }
};

// Generate historical mock readings
function generateMockHistory() {
    const now = new Date();
    const readings = [];
    
    for (let i = 0; i < 20; i++) {
        const timestamp = new Date(now - i * 60000 * 5);
        const voltage = (12.0 + Math.random() * 2.5).toFixed(2);
        const source = Math.random() > 0.5 ? 'wifi' : 'gsm';
        
        readings.push({
            id: i + 1,
            voltage: parseFloat(voltage),
            reading_time: timestamp.toISOString().replace('T', ' ').substring(0, 19),
            source: source
        });
    }
    
    return readings;
}

// Generate realistic live reading
function generateLiveReading() {
    const now = new Date();
    const hours = now.getHours();
    let baseVoltage = 12.0;
    
    // Simulate daytime charging
    if (hours > 6 && hours < 18) {
        baseVoltage = 13.0 + (hours - 6) * 0.1;
    } 
    // Simulate nighttime discharge
    else {
        baseVoltage = 13.0 - (hours > 18 ? hours - 18 : hours + 6) * 0.08;
    }
    
    const voltage = (baseVoltage + Math.random() * 0.3 - 0.15).toFixed(2);
    const source = Math.random() > 0.5 ? 'wifi' : 'gsm';
    
    return {
        voltage: parseFloat(voltage),
        reading_time: now.toISOString().replace('T', ' ').substring(0, 19),
        source: source
    };
}

// Initialize data
mockData.readings = generateMockHistory();

// Export data
window.mockData = mockData;
window.generateLiveReading = generateLiveReading;