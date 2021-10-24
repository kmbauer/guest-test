import { generateStaticSite, DiagnosticsError } from 'lwr';

generateStaticSite()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        if (err instanceof DiagnosticsError) {
            console.log('LWR Diagnostic Error: ');
            console.log(err.diagnostics);
            console.log(err.stack);
        } else {
            console.error(err);
        }
        process.exit(1);
    });