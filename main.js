const BASE_URL = window.location.hostname === 'localhost'
    ? ''
    : 'https://http://dg53.liveblog365.com/.com';
const ctx = document.getElementById('voltageChart').getContext('2d');
const voltageChart = new Chart(ctx, {

    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Battery Voltage (V)',
            data: [],
            borderColor: '#0d6efd',
            tension: 0.3,
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                min: 10,
                max: 15,
                title: {
                    display: true,
                    text: 'Voltage (V)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Time'
                }
            }
        }
    }
});

let DEMO_MODE = true;

// Alert function
function showAlert(title, message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <strong>${title}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.querySelector('.container').prepend(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Update mode UI
function updateModeUI() {
    const modeIndicator = document.getElementById('modeIndicator');
    const modeSwitch = document.getElementById('modeSwitch');
    const dataTypeBadge = document.getElementById('dataTypeBadge');

    if (DEMO_MODE) {
        modeIndicator.textContent = "Demo Mode";
        modeIndicator.className = "badge bg-warning me-2";
        modeSwitch.checked = true;
        dataTypeBadge.textContent = "Simulated";
        dataTypeBadge.className = "badge badge-demo ms-2";

        // Add info panel
        if (!document.getElementById('demoInfoPanel')) {
            const infoPanel = document.createElement('div');
            infoPanel.id = 'demoInfoPanel';
            infoPanel.className = 'status-sidebar';
            infoPanel.innerHTML = `
                <h5>Demo Mode Active</h5>
                <p>➤ Displaying simulated data</p>
                <p>➤ Readings update every 30 seconds</p>
                <p>➤ Test all features freely</p>
                <hr>
                <p>To switch to live mode:</p>
                <ol>
                    <li>Disable demo mode toggle</li>
                    <li>Ensure devices are connected</li>
                    <li>Verify server settings</li>
                </ol>
            `;
            document.body.appendChild(infoPanel);
            setTimeout(() => {
                const panel = document.getElementById('demoInfoPanel');
                if (panel) {
                    panel.style.opacity = '1';


                    let opacity = 1;
                    const fadeOutInterval = setInterval(() => {
                        opacity -= 0.05;
                        panel.style.opacity = opacity;

                        if (opacity <= 0) {
                            clearInterval(fadeOutInterval);
                            panel.style.display = 'none';
                        }
                    }, 100);
                }
            }, 5000);
        }
    } else {
        modeIndicator.textContent = "Live Mode";
        modeIndicator.className = "badge bg-success me-2";
        modeSwitch.checked = false;
        dataTypeBadge.textContent = "Real";
        dataTypeBadge.className = "badge bg-success ms-2";

        // Remove info panel
        const infoPanel = document.getElementById('demoInfoPanel');
        if (infoPanel) {
            infoPanel.remove();
        }
    }
}

// Fetch and update data
async function fetchData() {
    
        
        if (DEMO_MODE) {
            const newReading = generateLiveReading();

            // Update chart
            voltageChart.data.labels.push(newReading.reading_time);
            if (voltageChart.data.labels.length > 20) {
                voltageChart.data.labels.shift();
            }

            voltageChart.data.datasets[0].data.push(newReading.voltage);
            if (voltageChart.data.datasets[0].data.length > 20) {
                voltageChart.data.datasets[0].data.shift();
            }

            voltageChart.update();


            // Update latest reading
            document.getElementById('currentVoltage').textContent = newReading.voltage + 'V';
            document.getElementById('readingTime').textContent = newReading.reading_time;
            document.getElementById('sourceBadge').textContent =
                newReading.source === 'wifi' ? 'WiFi' : 'GSM';
            document.getElementById('sourceBadge').className =
                newReading.source === 'wifi' ? 'badge bg-success' : 'badge bg-primary';

            // Show alerts for critical values
            if (newReading.voltage < mockData.settings.min_voltage) {
                showAlert('Warning!', `Low battery voltage (${newReading.voltage}V)`, 'danger');
            }

            if (newReading.voltage > mockData.settings.max_voltage) {
                showAlert('Alert!', `High battery voltage (${newReading.voltage}V)`, 'warning');
            }

            // Add demo indicator
            document.getElementById('readingTime').innerHTML +=
                ' <span class="badge badge-demo">DEMO</span>';

            // Highlight critical voltage
            document.getElementById('currentVoltage').className =
                (newReading.voltage < mockData.settings.min_voltage ||
                    newReading.voltage > mockData.settings.max_voltage)
                    ? 'voltage-critical'
                    : '';

            // Update table
            const table = document.getElementById('readingsTable');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
            <td>${mockData.readings.length + 1}</td>
            <td>${newReading.voltage}V</td>
            <td>${newReading.reading_time} <span class="badge badge-demo">DEMO</span></td>
            <td><span class="badge ${newReading.source === 'wifi' ? 'bg-success' : 'bg-primary'}">
                ${newReading.source === 'wifi' ? 'WiFi' : 'GSM'}
            </span></td>
        `;

            if (table.firstChild) {
                table.insertBefore(newRow, table.firstChild);
            } else {
                table.appendChild(newRow);
            }

            if (table.children.length > 20) {
                table.removeChild(table.lastChild);
            }

        } else {
            try {
                const response = await fetch('../api/get_data.php');
                const data = await response.json();

                // Update chart
                voltageChart.data.labels = data.map(item => item.reading_time);
                voltageChart.data.datasets[0].data = data.map(item => item.voltage);
                voltageChart.update();

                // Update latest reading
                if (data.length > 0) {
                    const latest = data[0];
                    document.getElementById('currentVoltage').textContent = latest.voltage + 'V';
                    document.getElementById('readingTime').textContent = latest.reading_time;
                    document.getElementById('sourceBadge').textContent =
                        latest.source === 'wifi' ? 'WiFi' : 'GSM';
                    document.getElementById('sourceBadge').className =
                        latest.source === 'wifi' ? 'badge bg-success' : 'badge bg-primary';

                    // Highlight critical voltage
                    document.getElementById('currentVoltage').className =
                        (latest.voltage < settings.min_voltage ||
                            latest.voltage > settings.max_voltage)
                            ? 'voltage-critical'
                            : '';
                }

                // Update table
                let tableHtml = '';
                data.forEach(item => {
                    tableHtml += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.voltage}V</td>
                    <td>${item.reading_time}</td>
                    <td><span class="badge ${item.source === 'wifi' ? 'bg-success' : 'bg-primary'}">
                        ${item.source === 'wifi' ? 'WiFi' : 'GSM'}
                    </span></td>
                </tr>`;
                });
                document.getElementById('readingsTable').innerHTML = tableHtml;

            } catch (error) {
                console.error('Error fetching data:', error);
                showAlert('Connection Error', 'Failed to fetch live data', 'danger');
            }
        }
    
}

// Load settings
async function loadSettings() {
    if (DEMO_MODE) {
        document.getElementById('minVoltage').value = mockData.settings.min_voltage;
        document.getElementById('maxVoltage').value = mockData.settings.max_voltage;
        document.getElementById('gsmNumber').value = mockData.settings.gsm_number;
    } else {
        try {
            const response = await fetch('../api/get_settings.php');
            const settings = await response.json();

            document.getElementById('minVoltage').value = settings.min_voltage;
            document.getElementById('maxVoltage').value = settings.max_voltage;
            document.getElementById('gsmNumber').value = settings.gsm_number;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
}

// Save settings
document.getElementById('saveSettings').addEventListener('click', async () => {
    if (DEMO_MODE) {
        mockData.settings.min_voltage = parseFloat(document.getElementById('minVoltage').value);
        mockData.settings.max_voltage = parseFloat(document.getElementById('maxVoltage').value);
        mockData.settings.gsm_number = document.getElementById('gsmNumber').value;
        showAlert('Success', 'Settings saved (Demo Mode)', 'success');
    } else {
        const settings = {
            min_voltage: document.getElementById('minVoltage').value,
            max_voltage: document.getElementById('maxVoltage').value,
            gsm_number: document.getElementById('gsmNumber').value
        };

        try {
            await fetch('../api/save_settings.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            showAlert('Success', 'Settings saved successfully', 'success');
        } catch (error) {
            showAlert('Error', 'Failed to save settings', 'danger');
        }
    }
});

// Mode switch handler
document.getElementById('modeSwitch').addEventListener('change', function () {
    DEMO_MODE = this.checked;
    updateModeUI();
    fetchData();
    loadSettings();
});

// Initialize
updateModeUI();
fetchData();
loadSettings();

// Refresh data every 30 seconds
setInterval(fetchData, 30000);