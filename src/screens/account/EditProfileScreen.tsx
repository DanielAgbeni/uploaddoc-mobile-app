import React, { memo, useEffect, useState } from 'react';
import {
	View,
	TextInput,
	Pressable,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
	Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../providers/ThemeProvider';
import { useModal } from '../../providers/ModalProvider';
import { useUserStore } from '../../shared/user-store/useUserStore';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfile } from '../../api/user';
import {
	Trash2,
	Plus,
	DollarSign,
	MapPin,
	Clock,
	Phone,
	Link2,
	Info,
	ChevronLeftIcon,
	Store,
	CheckCircle2,
	XCircle,
} from 'lucide-react-native';
import { TextComponent } from 'src/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';

type Props = NativeStackScreenProps<AccountStackParamList, 'EditProfile'>;

// Validation Schema
const discountRateSchema = z.object({
	minPages: z.coerce.number().min(0, 'Min pages must be 0 or more'),
	maxPages: z.coerce.number().min(1, 'Max pages must be at least 1'),
	discount: z.coerce
		.number()
		.min(0, 'Discount must be 0 or more')
		.max(100, 'Discount cannot exceed 100%'),
});

const profileSchema = z.object({
	openingHours: z.string().optional(),
	printingCost: z.coerce
		.number()
		.min(0, 'Printing cost must be 0 or more')
		.optional(),
	printingLocation: z.string().optional(),
	supportContact: z.string().optional(),
	additionalInfo: z.string().optional(),
	adminStatus: z.enum(['active', 'inactive', 'suspended']).optional(),
	discountRates: z.array(discountRateSchema).optional(),
	slug: z
		.string()
		.regex(
			/^[a-z0-9-]*$/,
			'Only lowercase letters, numbers, and hyphens allowed',
		)
		.min(3, 'Slug must be at least 3 characters')
		.max(50, 'Slug cannot exceed 50 characters')
		.optional()
		.or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const SectionTitle = ({ title, icon: Icon }: { title: string; icon?: any }) => {
	const { colors } = useTheme();
	return (
		<View className="flex-row items-center mb-3">
			{Icon && (
				<View className="mr-2 bg-primary/10 p-1.5 rounded-lg">
					<Icon
						size={16}
						color={colors.primary}
					/>
				</View>
			)}
			<TextComponent className="text-foreground font-bold text-base">
				{title}
			</TextComponent>
		</View>
	);
};

function EditProfileScreen({ navigation }: Props) {
	const { colors } = useTheme();
	const { showAlert } = useModal();
	const { user, setUserDetails } = useUserStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<ProfileFormValues>({
		// @ts-ignore
		resolver: zodResolver(profileSchema),
		defaultValues: {
			openingHours: '',
			printingCost: undefined,
			printingLocation: '',
			supportContact: '',
			additionalInfo: '',
			adminStatus: 'inactive',
			discountRates: [],
			slug: '',
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'discountRates',
	});

	// Load user data into form
	useEffect(() => {
		if (user) {
			reset({
				openingHours: user.openingHours || '',
				printingCost: user.printingCost || undefined,
				printingLocation: user.printingLocation || '',
				supportContact: user.supportContact || '',
				additionalInfo: user.additionalInfo || '',
				adminStatus:
					(user.adminStatus as 'active' | 'inactive' | 'suspended') ||
					'inactive',
				discountRates: user.discountRates || [],
				slug: user.slug || '',
			});
		}
	}, [user, reset]);

	const onSubmit = async (data: ProfileFormValues) => {
		if (!user) return;
		setIsSubmitting(true);
		try {
			const response = await updateProfile(data);
			if (response.data) {
				if ((response.data as any).user) {
					setUserDetails((response.data as any).user);
				}

				showAlert({
					title: 'Success',
					message: 'Profile updated successfully',
					type: 'success',
					onConfirm: () => navigation.goBack(),
				});
			}
		} catch (error: any) {
			console.error('Update error:', error);
			showAlert({
				title: 'Error',
				message: error.response?.data?.message || 'Failed to update profile',
				type: 'error',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) return null;

	return (
		<View className="flex-1 bg-background">
			<SafeAreaView
				edges={['top']}
				className="flex-1">
				<View className="px-6 py-4bg-background z-10">
					<View className="flex-row items-center justify-between">
						<TouchableOpacity
							onPress={() => navigation.goBack()}
							className="p-2 -ml-2 rounded-full active:bg-muted/50">
							<ChevronLeftIcon
								size={24}
								color={colors.foreground}
							/>
						</TouchableOpacity>
						<TextComponent className="text-lg font-bold text-foreground">
							Edit Profile
						</TextComponent>
						<View className="w-10" />
					</View>
				</View>

				<ScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 100 }}>
					<View className="p-6 gap-4 space-y-6">
						{/* Status Card */}
						<View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
							<SectionTitle
								title="Service Status"
								icon={Store}
							/>
							<Controller
								control={control}
								name="adminStatus"
								render={({ field: { onChange, value } }) => (
									<View className="flex-row gap-3">
										{['active', 'inactive'].map((status) => {
											const isActive = value === status;
											return (
												<Pressable
													key={status}
													onPress={() => onChange(status)}
													className={clsx(
														'flex-1 py-3 px-4 rounded-xl border-2 flex-row items-center justify-center gap-2 transition-all',
														isActive
															? 'bg-primary/10 border-primary'
															: 'bg-muted/30 border-transparent',
													)}>
													{status === 'active' ? (
														<CheckCircle2
															size={18}
															color={
																isActive
																	? colors.primary
																	: colors.mutedForeground
															}
														/>
													) : (
														<XCircle
															size={18}
															color={
																isActive
																	? colors.primary
																	: colors.mutedForeground
															}
														/>
													)}
													<TextComponent
														className={clsx(
															'font-semibold capitalize',
															isActive
																? 'text-primary'
																: 'text-muted-foreground',
														)}>
														{status}
													</TextComponent>
												</Pressable>
											);
										})}
									</View>
								)}
							/>
							<View className="mt-3 bg-muted/30 p-3 rounded-lg">
								<TextComponent className="text-xs text-muted-foreground leading-5">
									Set to{' '}
									<TextComponent className="font-bold">Active</TextComponent> to
									allow users to see your profile and place orders. Switch to{' '}
									<TextComponent className="font-bold">Inactive</TextComponent>{' '}
									to temporarily hide your services.
								</TextComponent>
							</View>
						</View>

						{/* Business Details Card */}
						<View className="bg-card rounded-2xl p-4 shadow-sm border border-border space-y-4">
							<SectionTitle
								title="Business Details"
								icon={Info}
							/>

							{/* Printing Cost */}
							<View className="space-y-2">
								<TextComponent className="text-sm font-medium text-muted-foreground ml-1">
									Printing Cost per Page (₦)
								</TextComponent>
								<Controller
									control={control}
									name="printingCost"
									render={({ field: { onChange, onBlur, value } }) => (
										<View className="relative">
											<View className="absolute left-4 top-3.5 z-10 pointer-events-none">
												<DollarSign
													size={18}
													color={colors.mutedForeground}
												/>
											</View>
											<TextInput
												className="bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground font-medium text-base"
												placeholder="0.00"
												keyboardType="numeric"
												placeholderTextColor={colors.mutedForeground}
												onBlur={onBlur}
												onChangeText={onChange}
												value={value?.toString() ?? ''}
											/>
										</View>
									)}
								/>
								{errors.printingCost && (
									<TextComponent className="text-destructive text-xs ml-1">
										{errors.printingCost.message}
									</TextComponent>
								)}
							</View>

							{/* Location */}
							<View className="space-y-2">
								<TextComponent className="text-sm font-medium text-muted-foreground ml-1">
									Location
								</TextComponent>
								<Controller
									control={control}
									name="printingLocation"
									render={({ field: { onChange, onBlur, value } }) => (
										<View className="relative">
											<View className="absolute left-4 top-3.5 z-10 pointer-events-none">
												<MapPin
													size={18}
													color={colors.mutedForeground}
												/>
											</View>
											<TextInput
												className="bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground font-medium text-base"
												placeholder="e.g., Block B, Room 204"
												placeholderTextColor={colors.mutedForeground}
												onBlur={onBlur}
												onChangeText={onChange}
												value={value}
											/>
										</View>
									)}
								/>
								{errors.printingLocation && (
									<TextComponent className="text-destructive text-xs ml-1">
										{errors.printingLocation.message}
									</TextComponent>
								)}
							</View>

							{/* Slug */}
							<View className="space-y-2">
								<TextComponent className="text-sm font-medium text-muted-foreground ml-1">
									Custom URL Slug
								</TextComponent>
								<Controller
									control={control}
									name="slug"
									render={({ field: { onChange, onBlur, value } }) => (
										<View className="relative">
											<View className="absolute left-4 top-3.5 z-10 pointer-events-none">
												<Link2
													size={18}
													color={colors.mutedForeground}
												/>
											</View>
											<TextInput
												className="bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground font-medium text-base lowercase"
												placeholder="your-business-name"
												autoCapitalize="none"
												placeholderTextColor={colors.mutedForeground}
												onBlur={onBlur}
												onChangeText={onChange}
												value={value}
											/>
										</View>
									)}
								/>
								<TextComponent className="text-[10px] text-muted-foreground ml-1">
									uploaddoc.app/submit/{watch('slug') || 'your-slug'}
								</TextComponent>
								{errors.slug && (
									<TextComponent className="text-destructive text-xs ml-1">
										{errors.slug.message}
									</TextComponent>
								)}
							</View>
						</View>

						{/* Operations Card */}
						<View className="bg-card rounded-2xl p-4 shadow-sm border border-border space-y-4">
							<SectionTitle
								title="Operations"
								icon={Clock}
							/>

							{/* Opening Hours */}
							<View className="space-y-2">
								<TextComponent className="text-sm font-medium text-muted-foreground ml-1">
									Opening Hours
								</TextComponent>
								<Controller
									control={control}
									name="openingHours"
									render={({ field: { onChange, onBlur, value } }) => (
										<TextInput
											className="bg-muted/30 border border-border rounded-xl px-4 py-3.5 text-foreground font-medium text-base"
											placeholder="e.g. Mon-Fri: 9 AM - 5 PM"
											placeholderTextColor={colors.mutedForeground}
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
							</View>

							{/* Contact */}
							<View className="space-y-2">
								<TextComponent className="text-sm font-medium text-muted-foreground ml-1">
									Support Contact
								</TextComponent>
								<Controller
									control={control}
									name="supportContact"
									render={({ field: { onChange, onBlur, value } }) => (
										<View className="relative">
											<View className="absolute left-4 top-3.5 z-10 pointer-events-none">
												<Phone
													size={18}
													color={colors.mutedForeground}
												/>
											</View>
											<TextInput
												className="bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground font-medium text-base"
												placeholder="Phone number or email"
												placeholderTextColor={colors.mutedForeground}
												onBlur={onBlur}
												onChangeText={onChange}
												value={value}
											/>
										</View>
									)}
								/>
							</View>

							{/* Additional Info */}
							<View className="space-y-2">
								<TextComponent className="text-sm font-medium text-muted-foreground ml-1">
									Additional Information
								</TextComponent>
								<Controller
									control={control}
									name="additionalInfo"
									render={({ field: { onChange, onBlur, value } }) => (
										<TextInput
											className="bg-muted/30 border border-border rounded-xl px-4 py-3.5 text-foreground font-medium text-base min-h-[100px]"
											placeholder="Any other instructions for students..."
											placeholderTextColor={colors.mutedForeground}
											multiline
											textAlignVertical="top"
											onBlur={onBlur}
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
							</View>
						</View>

						{/* Discount Rates Card */}
						<View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
							<View className="flex-row items-center justify-between mb-4">
								<SectionTitle
									title="Discount Rates"
									icon={DollarSign}
								/>
								<Pressable
									onPress={() =>
										append({ minPages: 0, maxPages: 0, discount: 0 })
									}
									className="flex-row items-center bg-primary px-3 py-1.5 rounded-full shadow-sm active:opacity-90">
									<Plus
										size={14}
										color="#fff"
									/>
									<TextComponent className="text-white text-xs font-bold ml-1">
										ADD NEW
									</TextComponent>
								</Pressable>
							</View>

							<View className="space-y-3">
								{fields.map((field, index) => (
									<View
										key={field.id}
										className="bg-muted/30 border border-border rounded-xl p-3">
										<View className="flex-row items-end gap-3">
											<View className="flex-1 space-y-1.5">
												<TextComponent className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
													Min Pages
												</TextComponent>
												<Controller
													control={control}
													name={`discountRates.${index}.minPages`}
													render={({ field: { onChange, value } }) => (
														<TextInput
															className="bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium text-center"
															keyboardType="numeric"
															value={value?.toString() ?? ''}
															onChangeText={onChange}
														/>
													)}
												/>
											</View>
											<View className="flex-1 space-y-1.5">
												<TextComponent className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
													Max Pages
												</TextComponent>
												<Controller
													control={control}
													name={`discountRates.${index}.maxPages`}
													render={({ field: { onChange, value } }) => (
														<TextInput
															className="bg-background border border-border rounded-lg px-3 py-2 text-foreground font-medium text-center"
															keyboardType="numeric"
															value={value?.toString() ?? ''}
															onChangeText={onChange}
														/>
													)}
												/>
											</View>
											<View className="flex-1 space-y-1.5">
												<TextComponent className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
													Discount %
												</TextComponent>
												<Controller
													control={control}
													name={`discountRates.${index}.discount`}
													render={({ field: { onChange, value } }) => (
														<TextInput
															className="bg-background border border-border rounded-lg px-3 py-2 font-bold text-green-600 text-center"
															keyboardType="numeric"
															value={value?.toString() ?? ''}
															onChangeText={onChange}
														/>
													)}
												/>
											</View>
											<Pressable
												onPress={() => remove(index)}
												className="h-[42px] width-[42px] bg-destructive/10 items-center justify-center rounded-lg px-3 ml-1 active:bg-destructive/20">
												<Trash2
													size={18}
													color={colors.destructive}
												/>
											</Pressable>
										</View>
									</View>
								))}

								{fields.length === 0 && (
									<View className="items-center justify-center py-8 bg-muted/20 border border-dashed border-border rounded-xl">
										<TextComponent className="text-muted-foreground text-sm font-medium">
											No discount rates configured
										</TextComponent>
										<TextComponent className="text-muted-foreground/60 text-xs mt-1">
											Add rates to offer bulk discounts
										</TextComponent>
									</View>
								)}
							</View>
						</View>
					</View>
				</ScrollView>

				{/* Fixed Bottom Action Bar */}
				<View className="p-4 bg-background border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
					<Pressable
						className={`w-full bg-primary p-4 rounded-2xl items-center shadow-lg active:scale-[0.98] transition-transform ${
							isSubmitting ? 'opacity-80' : ''
						}`}
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}>
						{isSubmitting ? (
							<ActivityIndicator
								size="small"
								color="#fff"
							/>
						) : (
							<TextComponent className="text-primary-foreground font-bold text-lg">
								Save Changes
							</TextComponent>
						)}
					</Pressable>
				</View>
			</SafeAreaView>
		</View>
	);
}
export default memo(EditProfileScreen);
