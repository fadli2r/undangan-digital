import dbConnect, { checkDbHealth } from '../../lib/dbConnect';
import { withErrorHandler } from '../../utils/apiErrorHandler';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check database health first
    const healthStatus = await checkDbHealth();
    console.log('Database health status:', healthStatus);

    if (healthStatus.status !== 'healthy') {
      return res.status(503).json({
        error: 'Database health check failed',
        details: healthStatus
      });
    }

    // Try to establish a connection
    const conn = await dbConnect();
    
    // Get connection state
    const state = conn.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };

    return res.status(200).json({
      success: true,
      connection: {
        state: stateMap[state],
        readyState: state,
        host: conn.connection.host,
        name: conn.connection.name
      },
      health: healthStatus
    });

  } catch (error) {
    console.error('Test DB Error:', error);
    return res.status(500).json({
      error: 'Database connection test failed',
      details: error.message
    });
  }
}

export default withErrorHandler(handler);
