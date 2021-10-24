import { ResolveHookResponse, ServiceAPI } from "@lwrjs/types";

export default function stringResponse(serviceAPI: ServiceAPI): void {
    serviceAPI.addLoaderPlugin({
        resolveModule: async (id): Promise<ResolveHookResponse> => {
            if (id === 'example/guest/v/0_0_1') {
                const [specifier] = id.split('/v/'); // remove version from specifier
                return `${specifier}`;
            }
            // else return null to indicate the version was not stripped
            return null;
        },
    });
}
