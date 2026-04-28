import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { theme } from './theme';

type Tone =
  | 'ink'
  | 'ink2'
  | 'ink3'
  | 'ink4'
  | 'accent'
  | 'accentInk'
  | 'temp'
  | 'sleep';

type HeadingSize = 'D' | 'L' | 'M' | 'S';
type BodySize = 'M' | 'S';
type StackDirection = 'row' | 'col';
type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'ghost'
  | 'soft'
  | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type BadgeTone = 'ink' | 'accent' | 'warn' | 'info' | 'soft';

export type RecordTone =
  | 'feed'
  | 'sleep'
  | 'diaper'
  | 'temp'
  | 'bath'
  | 'note'
  | 'vitamin'
  | 'medicine';

const toneColor: Record<Tone, string> = {
  ink: theme.colors.ink,
  ink2: theme.colors.ink2,
  ink3: theme.colors.ink3,
  ink4: theme.colors.ink4,
  accent: theme.colors.accent,
  accentInk: theme.colors.accentInk,
  temp: theme.colors.temp,
  sleep: theme.colors.sleep,
};

export const recordTones: Record<
  RecordTone,
  { label: string; color: string; soft: string }
> = {
  feed: {
    label: '수유',
    color: theme.colors.feed,
    soft: theme.colors.feedSoft,
  },
  sleep: {
    label: '수면',
    color: theme.colors.sleep,
    soft: theme.colors.sleepSoft,
  },
  diaper: {
    label: '기저귀',
    color: theme.colors.diaper,
    soft: theme.colors.diaperSoft,
  },
  temp: {
    label: '체온',
    color: theme.colors.temp,
    soft: theme.colors.tempSoft,
  },
  bath: {
    label: '목욕',
    color: theme.colors.bath,
    soft: theme.colors.bathSoft,
  },
  note: {
    label: '메모',
    color: theme.colors.note,
    soft: theme.colors.noteSoft,
  },
  vitamin: {
    label: '비타민',
    color: theme.colors.vitamin,
    soft: theme.colors.vitaminSoft,
  },
  medicine: {
    label: '약',
    color: theme.colors.medicine,
    soft: theme.colors.medicineSoft,
  },
};

type TextPrimitiveProps = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Heading({
  size = 'L',
  children,
  style,
}: TextPrimitiveProps & { size?: HeadingSize }) {
  const textStyle = {
    D: theme.typography.display,
    L: theme.typography.titleL,
    M: theme.typography.titleM,
    S: theme.typography.titleS,
  }[size];

  return <Text style={[styles.inkText, textStyle, style]}>{children}</Text>;
}

export function Body({
  size = 'M',
  tone = 'ink2',
  children,
  style,
}: TextPrimitiveProps & { size?: BodySize; tone?: Tone }) {
  return (
    <Text
      style={[
        size === 'S' ? theme.typography.bodyS : theme.typography.body,
        { color: toneColor[tone] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Caption({
  tone = 'ink3',
  children,
  style,
}: TextPrimitiveProps & { tone?: Tone }) {
  return (
    <Text
      style={[theme.typography.caption, { color: toneColor[tone] }, style]}
    >
      {children}
    </Text>
  );
}

export function Eyebrow({
  tone = 'accent',
  children,
  style,
}: TextPrimitiveProps & { tone?: Tone }) {
  return (
    <Text
      style={[
        theme.typography.eyebrow,
        styles.eyebrow,
        { color: toneColor[tone] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Mono({
  tone = 'ink2',
  children,
  style,
}: TextPrimitiveProps & { tone?: Tone }) {
  return (
    <Text style={[theme.typography.mono, { color: toneColor[tone] }, style]}>
      {children}
    </Text>
  );
}

type StackProps = {
  children: ReactNode;
  gap?: number;
  dir?: StackDirection;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  style?: StyleProp<ViewStyle>;
};

export function Stack({
  children,
  gap = theme.spacing[3],
  dir = 'col',
  align,
  justify,
  style,
}: StackProps) {
  return (
    <View
      style={[
        {
          flexDirection: dir === 'col' ? 'column' : 'row',
          gap,
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Spacer({
  size = theme.spacing[4],
  axis = 'y',
}: {
  size?: number;
  axis?: 'x' | 'y';
}) {
  return <View style={axis === 'y' ? { height: size } : { width: size }} />;
}

export function Divider({ inset = 0 }: { inset?: number }) {
  return (
    <View style={[styles.divider, { marginLeft: inset, marginRight: inset }]} />
  );
}

type CardProps = {
  children: ReactNode;
  padding?: number;
  flush?: boolean;
  sunk?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  padding = theme.spacing[5],
  flush = false,
  sunk = false,
  style,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: sunk ? theme.colors.surfaceSunk : theme.colors.surface,
          padding: flush ? 0 : padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionLabel({
  children,
  action,
  style,
}: {
  children: ReactNode;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionLabel, style]}>
      <Eyebrow tone="ink3">{children}</Eyebrow>
      {action}
    </View>
  );
}

export function Section({
  label,
  action,
  children,
  padding,
  flush,
  style,
}: CardProps & {
  label?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <View style={[styles.section, style]}>
      {label === undefined ? null : (
        <SectionLabel action={action}>{label}</SectionLabel>
      )}
      <Card padding={padding} flush={flush}>
        {children}
      </Card>
    </View>
  );
}

type ButtonProps = PressableProps & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  leading,
  trailing,
  full = false,
  style,
  textStyle,
  ...pressableProps
}: ButtonProps) {
  const variantStyle = buttonVariantStyles[variant];
  const sizeStyle = buttonSizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variantStyle.container,
        sizeStyle.container,
        full && styles.full,
        pressed && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {leading}
      <Text style={[styles.buttonText, variantStyle.text, sizeStyle.text, textStyle]}>
        {children}
      </Text>
      {trailing}
    </Pressable>
  );
}

export function IconButton({
  children,
  size = 32,
  variant = 'secondary',
  style,
  ...pressableProps
}: PressableProps & {
  children: ReactNode;
  size?: number;
  variant?: Extract<ButtonVariant, 'primary' | 'secondary' | 'ghost'>;
  style?: StyleProp<ViewStyle>;
}) {
  const variantStyle = buttonVariantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.iconButton,
        variantStyle.container,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {children}
    </Pressable>
  );
}

export function Chip({
  children,
  active = false,
  dotColor,
  count,
  dashed = false,
  full = false,
  style,
  textStyle,
  ...pressableProps
}: PressableProps & {
  children: ReactNode;
  active?: boolean;
  dotColor?: string;
  count?: number;
  dashed?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? theme.colors.ink : theme.colors.surface,
          borderColor: active
            ? theme.colors.ink
            : dashed
              ? theme.colors.line2
              : theme.colors.line,
          borderStyle: dashed ? 'dashed' : 'solid',
          justifyContent: full ? 'center' : 'flex-start',
          width: full ? '100%' : undefined,
        },
        pressed && pressableProps.onPress !== undefined && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {dotColor === undefined ? null : (
        <View style={[styles.chipDot, { backgroundColor: dotColor }]} />
      )}
      <Text
        style={[
          styles.chipText,
          { color: active ? theme.colors.white : theme.colors.ink2 },
          textStyle,
        ]}
      >
        {children}
      </Text>
      {count === undefined || count <= 0 ? null : (
        <Text
          style={[
            styles.chipCount,
            { color: active ? 'rgba(255,255,255,0.6)' : theme.colors.ink4 },
          ]}
        >
          {count}
        </Text>
      )}
    </Pressable>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  style,
}: {
  value: T;
  onChange: (nextValue: T) => void;
  options: readonly { id: T; label: string; icon?: ReactNode }[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segmented, style]}>
      {options.map((option) => {
        const active = option.id === value;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            style={[styles.segmentedOption, active && styles.segmentedOptionActive]}
            onPress={() => onChange(option.id)}
          >
            {option.icon}
            <Text
              style={[
                styles.segmentedLabel,
                active && styles.segmentedLabelActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Badge({
  tone = 'ink',
  children,
  style,
  textStyle,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const toneStyle = badgeToneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.bg }, style]}>
      <Text style={[styles.badgeText, { color: toneStyle.fg }, textStyle]}>
        {children}
      </Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  compact = false,
  noBorder = false,
  style,
  inputStyle,
  ...textInputProps
}: TextInputProps & {
  label: string;
  compact?: boolean;
  noBorder?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View
      style={[
        styles.field,
        compact && styles.fieldCompact,
        noBorder && styles.noBorder,
        style,
      ]}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.colors.ink4}
        style={[styles.fieldInput, inputStyle]}
        {...textInputProps}
      />
    </View>
  );
}

export function Input({
  multiline = false,
  style,
  ...textInputProps
}: TextInputProps) {
  return (
    <TextInput
      multiline={multiline}
      placeholderTextColor={theme.colors.ink4}
      textAlignVertical={multiline ? 'top' : undefined}
      style={[styles.input, multiline && styles.multilineInput, style]}
      {...textInputProps}
    />
  );
}

export function ListRow({
  leading,
  title,
  sub,
  trailing,
  divider = true,
  padding = theme.spacing[5],
  onPress,
  style,
}: {
  leading?: ReactNode;
  title?: ReactNode;
  sub?: ReactNode;
  trailing?: ReactNode;
  divider?: boolean;
  padding?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const content = (
    <>
      {leading}
      <View style={styles.listText}>
        {typeof title === 'string' ? <Text style={styles.listTitle}>{title}</Text> : title}
        {typeof sub === 'string' ? <Text style={styles.listSub}>{sub}</Text> : sub}
      </View>
      {trailing}
    </>
  );

  if (onPress === undefined) {
    return (
      <View
        style={[
          styles.listRow,
          { padding },
          divider && styles.listDivider,
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.listRow,
        { padding },
        divider && styles.listDivider,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

export function Stat({
  label,
  value,
  sub,
  align = 'left',
  style,
}: {
  label: string;
  value: string;
  sub?: string;
  align?: TextStyle['textAlign'];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      <Caption style={{ textAlign: align }}>{label}</Caption>
      <Text style={[styles.statValue, { textAlign: align }]}>
        {value}
        {sub === undefined ? null : <Text style={styles.statSub}> {sub}</Text>}
      </Text>
    </View>
  );
}

export function EmptyState({
  title,
  sub,
  action,
  style,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.emptyState, style]}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {sub === undefined ? null : <Text style={styles.emptySub}>{sub}</Text>}
      {action === undefined ? null : <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  sub,
  trailing,
  style,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.screenHeader, style]}>
      {eyebrow === undefined ? null : <Eyebrow>{eyebrow}</Eyebrow>}
      <View style={styles.screenHeaderMain}>
        <View style={styles.screenHeaderText}>
          <Heading size="L">{title}</Heading>
          {sub === undefined ? null : (
            <Body size="S" tone="ink3" style={styles.screenHeaderSub}>
              {sub}
            </Body>
          )}
        </View>
        {trailing}
      </View>
    </View>
  );
}

export function RecordDot({
  type,
  size = 8,
}: {
  type: RecordTone;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: recordTones[type].color,
      }}
    />
  );
}

type ButtonVisualStyle = {
  container: ViewStyle;
  text: TextStyle;
};

const buttonVariantStyles: Record<ButtonVariant, ButtonVisualStyle> = {
  primary: {
    container: {
      backgroundColor: theme.colors.ink,
      borderColor: theme.colors.ink,
    },
    text: {
      color: theme.colors.white,
    },
  },
  accent: {
    container: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    text: {
      color: theme.colors.white,
    },
  },
  secondary: {
    container: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.line,
    },
    text: {
      color: theme.colors.ink,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    text: {
      color: theme.colors.ink2,
    },
  },
  soft: {
    container: {
      backgroundColor: theme.colors.accentSoft,
      borderColor: 'transparent',
    },
    text: {
      color: theme.colors.accentInk,
    },
  },
  danger: {
    container: {
      backgroundColor: theme.colors.temp,
      borderColor: theme.colors.temp,
    },
    text: {
      color: theme.colors.white,
    },
  },
};

const buttonSizeStyles: Record<ButtonSize, ButtonVisualStyle> = {
  sm: {
    container: {
      minHeight: 30,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    text: {
      fontSize: 12,
    },
  },
  md: {
    container: {
      minHeight: 38,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    text: {
      fontSize: 13,
    },
  },
  lg: {
    container: {
      minHeight: 48,
      paddingHorizontal: 18,
      paddingVertical: 14,
    },
    text: {
      fontSize: 14,
    },
  },
};

const badgeToneStyles: Record<BadgeTone, { bg: string; fg: string }> = {
  ink: { bg: theme.colors.surfaceSunk, fg: theme.colors.ink2 },
  accent: { bg: theme.colors.accentSoft, fg: theme.colors.accentInk },
  warn: { bg: theme.colors.tempSoft, fg: theme.colors.temp },
  info: { bg: theme.colors.sleepSoft, fg: theme.colors.sleep },
  soft: { bg: theme.colors.bg2, fg: theme.colors.ink3 },
};

const styles = StyleSheet.create({
  inkText: {
    color: theme.colors.ink,
  },
  eyebrow: {
    textTransform: 'uppercase',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.line,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
  section: {
    paddingHorizontal: theme.spacing[5],
    marginBottom: 18,
  },
  sectionLabel: {
    paddingHorizontal: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    borderWidth: 1,
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  buttonText: {
    fontWeight: '600',
  },
  full: {
    width: '100%',
  },
  iconButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    minHeight: 32,
    borderWidth: 1,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipCount: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  segmented: {
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surfaceSunk,
    flexDirection: 'row',
  },
  segmentedOption: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  segmentedOptionActive: {
    backgroundColor: theme.colors.ink,
  },
  segmentedLabel: {
    color: theme.colors.ink3,
    fontSize: 11,
    fontWeight: '600',
  },
  segmentedLabelActive: {
    color: theme.colors.white,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  field: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  fieldCompact: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    minWidth: 84,
    color: theme.colors.ink3,
    fontSize: 13,
    fontWeight: '500',
  },
  fieldInput: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    padding: 0,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '500',
  },
  multilineInput: {
    minHeight: 92,
  },
  listRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  listDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
  },
  listText: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  listSub: {
    marginTop: 2,
    color: theme.colors.ink3,
    fontSize: 12,
  },
  statValue: {
    marginTop: theme.spacing[1],
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  statSub: {
    color: theme.colors.ink3,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    paddingHorizontal: 18,
    paddingVertical: theme.spacing[8],
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.line2,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.ink2,
    fontSize: 14,
    fontWeight: '600',
  },
  emptySub: {
    marginTop: theme.spacing[2],
    color: theme.colors.ink3,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: theme.spacing[5],
  },
  screenHeader: {
    paddingHorizontal: theme.spacing[7],
    paddingTop: theme.spacing[3],
    paddingBottom: 18,
  },
  screenHeaderMain: {
    marginTop: theme.spacing[2],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.spacing[4],
  },
  screenHeaderText: {
    flex: 1,
  },
  screenHeaderSub: {
    marginTop: theme.spacing[1],
  },
  pressed: {
    opacity: 0.82,
  },
});
