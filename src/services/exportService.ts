import { Share, Alert, Platform } from 'react-native';
import { Activity } from '../types/database';
import { i18n } from '../i18n';

/**
 * Format date untuk display
 */
const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format duration dari detik ke format readable
 */
const formatDuration = (seconds?: number): string => {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${minutes} menit`;
};

/**
 * Export activities ke CSV format
 */
export const exportToCSV = async (
  activities: Activity[],
  filename: string = 'parenting_journal',
): Promise<void> => {
  try {
    // CSV Header
    const headers = ['Tanggal', 'Tipe Aktivitas', 'Deskripsi', 'Durasi', 'Catatan', 'Child ID'];

    // CSV Rows
    const rows = activities.map((activity) => {
      const type = activity.type;
      const typeLabel =
        {
          feeding: 'Makan',
          sleep: 'Tidur',
          diaper: 'Ganti Popok',
          mood: 'Mood',
          growth: 'Pertumbuhan',
        }[type] || type;

      let description = '';
      if (type === 'feeding') {
        description = activity.value || 'ASI/Susu';
      } else if (type === 'diaper') {
        description = activity.value || 'Basah';
      } else if (type === 'mood') {
        description = activity.value || '-';
      } else if (type === 'growth') {
        const metadata = activity.metadata as any;
        description = `Berat: ${metadata?.weight_kg || '-'} kg, Tinggi: ${metadata?.height_cm || '-'} cm`;
      }

      return [
        formatDate(activity.created_at),
        typeLabel,
        description,
        formatDuration(activity.duration_seconds || undefined),
        activity.metadata?.notes || '-',
        activity.child_id || '-',
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Share CSV content as text
    const result = await Share.share({
      message: csvContent,
      title: `${filename}_${new Date().toLocaleDateString('id-ID')}.csv`,
    });

    if (result.action === Share.sharedAction) {
      Alert.alert(i18n.t('export.success'), i18n.t('export.journalShared'));
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

/**
 * Export activities ke Text format (lebih readable)
 */
export const exportToText = async (
  activities: Activity[],
  filename: string = 'parenting_journal',
): Promise<void> => {
  try {
    let textContent = '📓 JURNAL PARENTING\n';
    textContent += '═'.repeat(50) + '\n\n';
    textContent += `Total Catatan: ${activities.length}\n`;
    textContent += `Diekspor: ${formatDate(new Date().toISOString())}\n\n`;
    textContent += '═'.repeat(50) + '\n\n';

    activities.forEach((activity, index) => {
      const type = activity.type;
      const typeEmoji =
        {
          feeding: '🍼',
          sleep: '😴',
          diaper: '🧷',
          mood: '😊',
          growth: '📈',
        }[type] || '📝';

      const typeLabel =
        {
          feeding: 'Makan',
          sleep: 'Tidur',
          diaper: 'Ganti Popok',
          mood: 'Mood',
          growth: 'Pertumbuhan',
        }[type] || type;

      textContent += `${index + 1}. ${typeEmoji} ${typeLabel.toUpperCase()}\n`;
      textContent += `${'─'.repeat(50)}\n`;
      textContent += `📅 Waktu: ${formatDate(activity.created_at)}\n`;

      if (type === 'feeding') {
        textContent += `🍽️ Jenis: ${activity.value || 'ASI/Susu'}\n`;
        if (activity.duration_seconds) {
          textContent += `⏱️ Durasi: ${formatDuration(activity.duration_seconds)}\n`;
        }
      } else if (type === 'sleep') {
        if (activity.duration_seconds) {
          textContent += `⏱️ Durasi: ${formatDuration(activity.duration_seconds)}\n`;
        }
        if (activity.start_time) {
          textContent += `🕐 Mulai: ${formatDate(activity.start_time)}\n`;
        }
        if (activity.end_time) {
          textContent += `🕐 Selesai: ${formatDate(activity.end_time)}\n`;
        }
      } else if (type === 'diaper') {
        textContent += `💧 Kondisi: ${activity.value || 'Basah'}\n`;
      } else if (type === 'mood') {
        textContent += `😊 Mood: ${activity.value || '-'}\n`;
      } else if (type === 'growth') {
        const metadata = activity.metadata as any;
        if (metadata?.weight_kg) {
          textContent += `⚖️ Berat: ${metadata.weight_kg} kg\n`;
        }
        if (metadata?.height_cm) {
          textContent += `📏 Tinggi: ${metadata.height_cm} cm\n`;
        }
      }

      if (activity.metadata?.notes) {
        textContent += `📝 Catatan: ${activity.metadata.notes}\n`;
      }

      textContent += '\n';
    });

    textContent += '═'.repeat(50) + '\n';
    textContent += '✨ End of Journal ✨\n';

    // Share text content
    const result = await Share.share({
      message: textContent,
      title: `${filename}_${new Date().toLocaleDateString('id-ID')}.txt`,
    });

    if (result.action === Share.sharedAction) {
      Alert.alert(i18n.t('export.success'), i18n.t('export.journalShared'));
    }
  } catch (error) {
    console.error('Error exporting to text:', error);
    throw error;
  }
};
