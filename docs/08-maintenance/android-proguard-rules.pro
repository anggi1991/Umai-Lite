# Android ProGuard Rules for Parenting AI App
# Add these rules to prevent issues in release builds

# ============================================
# AsyncStorage (Critical for Session Persistence)
# ============================================
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keepclassmembers class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# ============================================
# React Native Core
# ============================================
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep native modules
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }

# Keep React Native method names
-keepclassmembers class ** {
  @com.facebook.react.bridge.ReactMethod *;
}

# ============================================
# Supabase & Network
# ============================================
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# OkHttp (used by Supabase)
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# ============================================
# RevenueCat (for Subscriptions)
# ============================================
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }
-dontwarn com.revenuecat.purchases.**

# ============================================
# Google Sign-In (Native)
# ============================================
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**

# Keep Google Sign-In classes
-keep class com.google.android.gms.auth.** { *; }
-keep class com.google.android.gms.common.** { *; }

# ============================================
# Expo Modules
# ============================================
-keep class expo.** { *; }
-keep class versioned.host.exp.exponent.** { *; }
-keepclassmembers class * {
  @expo.modules.core.interfaces.ExpoProp *;
}

# Expo SecureStore
-keep class expo.modules.securestore.** { *; }
-dontwarn expo.modules.securestore.**

# ============================================
# Google Play Services (for Auth & AdMob)
# ============================================
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Google Auth
-keep class com.google.android.gms.auth.** { *; }
-keep class com.google.android.gms.common.** { *; }

# ============================================
# Image Loading & Media
# ============================================
# Expo Image Picker
-keep class expo.modules.imagepicker.** { *; }
-dontwarn expo.modules.imagepicker.**

# Glide (if used)
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

# ============================================
# JSON & Serialization
# ============================================
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod

# Gson (if used)
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# ============================================
# JavaScript Interface
# ============================================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ============================================
# Native Crashes Prevention
# ============================================
# Keep crash reporting classes
-keep class com.facebook.react.modules.debug.** { *; }
-keep class com.facebook.react.devsupport.** { *; }

# ============================================
# General Android
# ============================================
# Keep View constructors
-keepclassmembers public class * extends android.view.View {
    void set*(***);
    *** get*();
}

# Keep Parcelable
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# ============================================
# Remove Logging (Optional - for final release)
# ============================================
# Uncomment to remove console.log in production
# -assumenosideeffects class android.util.Log {
#     public static *** d(...);
#     public static *** v(...);
#     public static *** i(...);
# }

# ============================================
# Debugging (Remove after testing)
# ============================================
# Keep source file and line numbers for stack traces
-keepattributes SourceFile,LineNumberTable

# Keep React Native dev tools (remove in final production)
-keep class com.facebook.react.devsupport.** { *; }
-keep class com.facebook.react.modules.debug.** { *; }
