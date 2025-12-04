import { StyleSheet } from 'react-native';
import theme from '../../theme';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  header: { 
    padding: theme.spacing.lg, 
    paddingTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  headerTitle: { 
    color: theme.colors.white, 
    fontWeight: 'bold',
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  scroll: { 
    paddingBottom: 120,
    padding: theme.spacing.md,
  },
  emptyCard: { 
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: { 
    marginBottom: theme.spacing.lg, 
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  addButton: {
    marginTop: theme.spacing.md,
  },
  reminderCard: { 
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  flex: { 
    flex: 1,
  },
  reminderType: { 
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  reminderTime: { 
    color: theme.colors.textSecondary, 
    marginTop: theme.spacing.xs,
  },
  reminderNotes: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  actions: { 
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  deleteButton: {
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  deleteButtonLoading: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.borders.radius.medium,
    paddingVertical: 8,
    paddingHorizontal: 16,
    opacity: 0.8,
  },
  deleteLoadingText: {
    marginLeft: 8,
    color: theme.colors.error,
  },
  fab: { 
    position: 'absolute', 
    right: theme.spacing.lg, 
    bottom: theme.spacing.lg, 
    backgroundColor: theme.colors.babyBlue,
  },
});