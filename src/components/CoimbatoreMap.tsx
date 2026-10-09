import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapLocation, LocationCategory } from '../types';

interface CoimbatoreMapProps {
  locations: MapLocation[];
  onSelectLocation?: (location: MapLocation) => void;
  onRegisterComplaintClick?: () => void;
  selectedCategoryFilter?: string;
  heightClassName?: string;
}

const CATEGORY_COLORS: Record<LocationCategory, string> = {
  'Municipal Office': '#2563eb', // Blue
  Hospital: '#dc2626', // Red
  'Police Station': '#1e293b', // Dark Slate
  'Fire Station': '#ea580c', // Orange
  'Bus Stand': '#0284c7', // Sky
  'Railway Station': '#7c3aed', // Purple
  'Garbage Collection': '#16a34a', // Green
  'Recycling Center': '#059669', // Emerald
  'Complaint Marker': '#f59e0b', // Amber
};

const CATEGORY_ICONS: Record<LocationCategory, string> = {
  'Municipal Office': 'fa-building-columns',
  Hospital: 'fa-hospital',
  'Police Station': 'fa-shield-halved',
  'Fire Station': 'fa-fire-extinguisher',
  'Bus Stand': 'fa-bus',
  'Railway Station': 'fa-train',
  'Garbage Collection': 'fa-dumpster',
  'Recycling Center': 'fa-recycle',
  'Complaint Marker': 'fa-triangle-exclamation',
};

const COIMBATORE_WARDS = [
  'All Wards (Coimbatore Master Map)',
  'Ward 24 (RS Puram)',
  'Ward 32 (Gandhipuram)',
  'Ward 58 (Singanallur)',
  'Ward 12 (Town Hall)',
  'Ward 45 (Peelamedu)',
  'Ward 67 (Ukkadam)',
  'Ward 15 (Ganapathy)',
  'Ward 82 (Kuniamuthur)',
];

const WARD_CENTER_COORDS: Record<string, [number, number]> = {
  'Ward 24 (RS Puram)': [11.0105, 76.9472],
  'Ward 32 (Gandhipuram)': [11.0183, 76.9644],
  'Ward 58 (Singanallur)': [10.9972, 77.0255],
  'Ward 12 (Town Hall)': [11.0018, 76.9629],
  'Ward 45 (Peelamedu)': [11.0289, 76.9994],
  'Ward 67 (Ukkadam)': [10.9902, 76.9610],
  'Ward 15 (Ganapathy)': [11.0366, 76.9744],
  'Ward 82 (Kuniamuthur)': [10.9575, 76.9488],
};

export const CoimbatoreMap: React.FC<CoimbatoreMapProps> = ({
  locations,
  onSelectLocation,
  onRegisterComplaintClick,
  selectedCategoryFilter = 'All',
  heightClassName = 'h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>(selectedCategoryFilter);
  const [selectedWard, setSelectedWard] = useState<string>('All Wards (Coimbatore Master Map)');
  const [isHeatmapMode, setIsHeatmapMode] = useState<boolean>(false);
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<MapLocation | null>(null);

  // Default Coimbatore Center Coordinates
  const CBE_CENTER: [number, number] = [11.0168, 76.9558];

  // Categories list
  const categories: (LocationCategory | 'All')[] = [
    'All',
    'Municipal Office',
    'Hospital',
    'Police Station',
    'Fire Station',
    'Bus Stand',
    'Railway Station',
    'Garbage Collection',
    'Recycling Center',
    'Complaint Marker',
  ];

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: CBE_CENTER,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | CCMC Smart City GIS',
        maxZoom: 18,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Ward Selection Change & Map Center Pan
  const handleWardChange = (ward: string) => {
    setSelectedWard(ward);
    if (!mapInstanceRef.current) return;

    if (ward !== 'All Wards (Coimbatore Master Map)' && WARD_CENTER_COORDS[ward]) {
      const coords = WARD_CENTER_COORDS[ward];
      mapInstanceRef.current.setView(coords, 15, { animate: true });
    } else {
      mapInstanceRef.current.setView(CBE_CENTER, 13, { animate: true });
    }
  };

  // Render Markers and Heatmap Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    group.clearLayers();

    // 1. Filter Locations by Category and Selected Ward
    let filtered =
      activeCategory === 'All'
        ? locations
        : locations.filter((loc) => loc.category === activeCategory);

    if (selectedWard !== 'All Wards (Coimbatore Master Map)') {
      filtered = filtered.filter((loc) => loc.address.includes(selectedWard) || (selectedWard.includes('RS Puram') && loc.address.includes('RS Puram')));
    }

    // 2. Render Heatmap Density Circles if Heatmap Mode active
    if (isHeatmapMode) {
      filtered.forEach((loc) => {
        const isComplaint = loc.category === 'Complaint Marker';
        const color = isComplaint ? '#ef4444' : '#f59e0b';
        
        const heatCircle = L.circle([loc.latitude, loc.longitude], {
          radius: isComplaint ? 350 : 250,
          color: color,
          fillColor: color,
          fillOpacity: 0.45,
          weight: 2,
        });

        heatCircle.bindPopup(`
          <div style="font-family:'Poppins',sans-serif; padding:4px; font-size:12px;">
            <strong style="color:${color}; font-weight:800;">🔥 Grievance Density Hotspot</strong>
            <div style="font-weight:700; margin-top:2px;">${loc.name}</div>
            <div style="font-size:11px; color:#475569;">${loc.address}</div>
          </div>
        `);

        group.addLayer(heatCircle);
      });
      return;
    }

    // 3. Render Normal Pins
    filtered.forEach((loc) => {
      const color = CATEGORY_COLORS[loc.category] || '#2563eb';
      const iconName = CATEGORY_ICONS[loc.category] || 'fa-location-dot';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
            font-size: 14px;
          ">
            <i class="fa-solid ${iconName}"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: 'Poppins', sans-serif; padding: 4px; max-width: 240px;">
          <div style="font-size: 10px; font-weight: 700; color: ${color}; text-transform: uppercase; margin-bottom: 2px;">
            ${loc.category} ${loc.status ? `• ${loc.status}` : ''}
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
            ${loc.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px; line-height: 1.3;">
            <i class="fa-solid fa-location-dot" style="margin-right: 4px; color: #64748b;"></i>${loc.address}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #0284c7; margin-bottom: 8px;">
            <i class="fa-solid fa-phone" style="margin-right: 4px;"></i>${loc.phone}
          </div>
          <button id="btn-loc-${loc.id}" style="
            width: 100%;
            background-color: #2563eb;
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
          ">
            View Details & Route
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`btn-loc-${loc.id}`);
          if (btn) {
            btn.onclick = () => {
              setSelectedLoc(loc);
              if (onSelectLocation) onSelectLocation(loc);
            };
          }
        }, 100);
      });

      group.addLayer(marker);
    });
  }, [locations, activeCategory, selectedWard, isHeatmapMode]);

  // Handle Draw Route Navigation
  const handleNavigate = (loc: MapLocation) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    setNavigatingTo(loc);

    // Remove existing route if any
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    // Origin: CCMC Head Office Town Hall (11.0018, 76.9629)
    const origin: [number, number] = [11.0018, 76.9629];
    const destination: [number, number] = [loc.latitude, loc.longitude];

    // Simple realistic polyline navigation path
    const polyline = L.polyline([origin, destination], {
      color: '#2563eb',
      weight: 5,
      dashArray: '10, 8',
      opacity: 0.9,
    }).addTo(map);

    routePolylineRef.current = polyline;

    // Fit bounds to show route
    const bounds = L.latLngBounds([origin, destination]);
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleClearRoute = () => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      mapInstanceRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
    setNavigatingTo(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Map Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <i className="fa-solid fa-map-location-dot"></i>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Coimbatore Smart City GIS Map</span>
              {isHeatmapMode && (
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  🔥 Heatmap Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Interactive municipal facility & complaint tracker
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Ward Filter Select Dropdown */}
          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-blue-600 outline-hidden"
          >
            {COIMBATORE_WARDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          {/* Heatmap Toggle Button */}
          <button
            type="button"
            onClick={() => setIsHeatmapMode(!isHeatmapMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isHeatmapMode
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <i className="fa-solid fa-fire text-amber-400"></i>
            <span>{isHeatmapMode ? 'Disable Heatmap' : '🔥 Grievance Heatmap'}</span>
          </button>

          {/* Quick Complaint Trigger */}
          {onRegisterComplaintClick && (
            <button
              onClick={onRegisterComplaintClick}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <i className="fa-solid fa-circle-plus"></i> Register Complaint
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat !== 'All' && (
              <i className={`fa-solid ${CATEGORY_ICONS[cat as LocationCategory]}`}></i>
            )}
            {cat}
          </button>
        ))}
      </div>

      {/* Navigation Banner if active */}
      {navigatingTo && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between text-xs text-blue-900 font-semibold">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-route text-blue-600 animate-bounce"></i>
            <span>
              Navigating route from <strong>CCMC Town Hall</strong> to{' '}
              <strong>{navigatingTo.name}</strong>
            </span>
          </div>
          <button
            onClick={handleClearRoute}
            className="text-rose-600 hover:text-rose-800 font-bold px-2 py-0.5 rounded bg-rose-100"
          >
            Clear Route
          </button>
        </div>
      )}

      {/* Map Element */}
      <div className={`relative ${heightClassName}`}>
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Selected Location Modal / Drawer */}
      {selectedLoc && (
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{
                backgroundColor:
                  CATEGORY_COLORS[selectedLoc.category] || '#2563eb',
              }}
            >
              <i
                className={`fa-solid ${
                  CATEGORY_ICONS[selectedLoc.category] || 'fa-location-dot'
                }`}
              ></i>
            </div>
            <div>
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                {selectedLoc.category}
              </div>
              <h4 className="font-bold text-sm text-white">{selectedLoc.name}</h4>
              <p className="text-xs text-slate-300">{selectedLoc.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate(selectedLoc)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-location-arrow"></i> Navigate Route
            </button>
            <a
              href={`tel:${selectedLoc.phone}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-phone"></i> Call
            </a>
            <button
              onClick={() => setSelectedLoc(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-2.5 py-2 rounded-xl"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
