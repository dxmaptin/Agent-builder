/**
 * OpenTelemetry Instrumentation Entry Point
 *
 * This is the main entry point for OpenTelemetry instrumentation.
 * It delegates to runtime-specific instrumentation modules.
 */
export async function register() {
  // Initialize standalone mode if enabled (Node.js runtime only)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initializeStandaloneMode, isStandaloneModeEnabled } = await import('./lib/standalone')
      if (isStandaloneModeEnabled()) {
        console.log('🚀 Standalone mode detected - initializing...')
        await initializeStandaloneMode()
        console.log('✅ Standalone mode initialized successfully')
      }
    } catch (error) {
      console.error('❌ Failed to initialize standalone mode:', error)
    }
  }

  // Load Node.js-specific instrumentation
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const nodeInstrumentation = await import('./instrumentation-node')
    if (nodeInstrumentation.register) {
      await nodeInstrumentation.register()
    }
  }

  // Load Edge Runtime-specific instrumentation
  if (process.env.NEXT_RUNTIME === 'edge') {
    const edgeInstrumentation = await import('./instrumentation-edge')
    if (edgeInstrumentation.register) {
      await edgeInstrumentation.register()
    }
  }

  // Load client instrumentation if we're on the client
  if (typeof window !== 'undefined') {
    await import('./instrumentation-client')
  }
}
