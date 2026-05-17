/**
 * UNC Color Utilities
 * Centralized color management for TalentTrackUNC
 * Ensures consistent, harmonious colors throughout the application
 */

export const UNCColors = {
  // Talent Group Colors - harmonious with burgundy/gold
  talentGroup: {
    'marching-band': '#C03B3B',     // Red - rgb(192, 59, 59)
    'majorettes': '#812F83',         // Purple - rgb(129, 47, 131)
    'glee-club': '#C88E0A',          // Gold - rgb(200, 142, 10)
    'dance-club': '#0047B5',         // Blue - rgb(0, 71, 181)
  },
  
  // Status Colors - professional and harmonious
  status: {
    success: '#2d7a3e',      // Forest green
    info: '#1a5f7a',         // Deep teal
    warning: '#c5740a',      // Burnt orange
    danger: '#a81010',       // Deep red
    pending: '#6c757d',      // Gray
  },
  
  // Event Type Colors
  eventType: {
    performance: '#1a5f7a',  // Deep teal
    competition: '#880808',   // UNC burgundy
    rehearsal: '#2d7a3e',    // Forest green
    workshop: '#c5740a',     // Burnt orange
    meeting: '#6c757d',      // Gray
  },
  
  // Notification Badge
  notification: '#a81010',   // Deep red
  
  // Unread indicator
  unread: '#1a5f7a',        // Deep teal
} as const;

/**
 * Get talent group badge color
 */
export function getTalentGroupColor(group: string): string {
  const groupKey = group as keyof typeof UNCColors.talentGroup;
  return UNCColors.talentGroup[groupKey] || '#6c757d';
}

/**
 * Get talent group text name
 */
export function getTalentGroupName(group: string): string {
  const names: Record<string, string> = {
    'marching-band': 'Marching Band',
    'majorettes': 'Majorettes',
    'glee-club': 'Glee Club',
    'dance-club': 'Dance Club',
  };
  return names[group] || group;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const statusKey = status as keyof typeof UNCColors.status;
  return UNCColors.status[statusKey] || UNCColors.status.pending;
}

/**
 * Get event type color
 */
export function getEventTypeColor(type: string): string {
  const typeKey = type as keyof typeof UNCColors.eventType;
  return UNCColors.eventType[typeKey] || '#6c757d';
}