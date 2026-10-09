/* ========================================================
   CityConnect – Coimbatore Smart City Service Portal
   Core Client-Side JavaScript & Leaflet Map Controller
   ======================================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('CityConnect Portal initialized successfully.');

    // Auto dismiss flash messages after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
});
