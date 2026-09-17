using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using NXOpen;

namespace DSHNXBridge
{
    // Read-only bootstrap bridge. Mutating NXOpen handlers remain disabled until
    // each typed operation passes the real-NX acceptance checklist.
    public static class BridgeEntry
    {
        private static HttpListener? listener;
        private static Thread? worker;

        public static void Main(string[] args)
        {
            if (listener != null) return;
            var token = Environment.GetEnvironmentVariable("DSH_NX_BRIDGE_TOKEN");
            if (string.IsNullOrWhiteSpace(token))
                throw new InvalidOperationException("DSH_NX_BRIDGE_TOKEN must be set before loading the bridge.");

            var port = Environment.GetEnvironmentVariable("DSH_NX_BRIDGE_PORT") ?? "48161";
            listener = new HttpListener();
            listener.Prefixes.Add($"http://127.0.0.1:{port}/");
            listener.Start();
            worker = new Thread(() => Serve(listener, token)) { IsBackground = true, Name = "dsh-nx-readonly-bridge" };
            worker.Start();
            Session.GetSession().ListingWindow.Open();
            Session.GetSession().ListingWindow.WriteLine($"dsh-nx read-only bridge listening on 127.0.0.1:{port}");
        }

        private static void Serve(HttpListener server, string token)
        {
            while (server.IsListening)
            {
                try
                {
                    var context = server.GetContext();
                    Handle(context, token);
                }
                catch (HttpListenerException) when (!server.IsListening) { return; }
                catch { /* Keep the read-only diagnostic bridge alive. */ }
            }
        }

        private static void Handle(HttpListenerContext context, string token)
        {
            context.Response.ContentType = "application/json";
            if (!string.Equals(context.Request.Headers["Authorization"], $"Bearer {token}", StringComparison.Ordinal))
            {
                context.Response.StatusCode = 401;
                Write(context, "{\"ok\":false,\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid bridge token\"}}");
                return;
            }

            string body;
            using (var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding)) body = reader.ReadToEnd();
            if (body.Contains("\"method\":\"health\""))
            {
                // Do not touch NXOpen from this background listener. Mutating and
                // session-reading handlers require an accepted NX main-thread dispatcher.
                Write(context, "{\"ok\":true,\"result\":{\"connected\":true,\"mode\":\"nx2512-transport-only-unverified\",\"verified\":false}}");
                return;
            }
            if (body.Contains("\"method\":\"capabilities\""))
            {
                Write(context, "{\"ok\":true,\"result\":{\"adapter\":\"nx2512-readonly-unverified\",\"verified\":false,\"operations\":[]}}");
                return;
            }
            Write(context, "{\"ok\":false,\"error\":{\"code\":\"UNSUPPORTED_UNVERIFIED\",\"message\":\"Mutating NX 2512 handlers are disabled until real-runtime acceptance\"}}");
        }

        private static void Write(HttpListenerContext context, string json)
        {
            var bytes = Encoding.UTF8.GetBytes(json);
            context.Response.ContentLength64 = bytes.Length;
            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
            context.Response.Close();
        }

        public static int GetUnloadOption(string dummy) => (int)Session.LibraryUnloadOption.Explicitly;

        public static void UnloadLibrary(string dummy)
        {
            listener?.Stop();
            listener?.Close();
            listener = null;
            worker = null;
        }
    }
}
