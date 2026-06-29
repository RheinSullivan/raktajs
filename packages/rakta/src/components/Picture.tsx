import React, {
	type CSSProperties,
	type HTMLAttributes,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

type ObjectFitValue = "contain" | "cover" | "fill" | "none" | "scale-down";
type LoadingValue = "lazy" | "eager" | "auto";

export interface PictureProps
	extends Omit<
		HTMLAttributes<HTMLPictureElement>,
		"children" | "onError" | "onLoad"
	> {
	path: string;
	alt: string;
	title?: string;
	height?: number;
	width?: number;
	loading?: LoadingValue;
	responsive?: boolean;
	blurDataURL?: string;
	objectFit?: ObjectFitValue;
	priority?: boolean;
	onLoadComplete?: () => void;
	onError?: () => void;
	className?: string;
	style?: CSSProperties;
}

export function Picture({
	path,
	alt,
	title,
	height,
	width,
	blurDataURL,
	onLoadComplete,
	onError,
	className,
	style,
	loading = "lazy",
	responsive = true,
	objectFit = "cover",
	priority = false,
	...rest
}: PictureProps): React.ReactElement {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);
	const pictureRef = useRef<HTMLPictureElement>(null);

	// If prioritu is set, override loading to eager
	const resolvedLoading: "lazy" | "eager" = priority
		? "eager"
		: loading === "auto"
			? "lazy"
			: loading;

	// Check if the image is already loaded or cached
	useEffect(() => {
		const picture = pictureRef.current;
		if (picture) {
			setIsLoaded(true);
			onLoadComplete?.();
		}
	}, [onLoadComplete]);

	const handleLoad = useCallback(() => {
		setIsLoaded(true);
		onLoadComplete?.();
	}, [onLoadComplete]);

	const handleError = useCallback(() => {
		setHasError(true);
		onError?.();
	}, [onError]);

	const resolvedPath = hasError && blurDataURL ? blurDataURL : path;

	const wrapperStyle: CSSProperties = {
		position: "relative",
		display: "inline-block",
		overflow: "hidden",
		height: height ?? "auto",
		width: responsive ? "100%" : (width ?? "auto"),
	};

	const pictureStyle: CSSProperties = {
		display: "block",
		height: height ?? undefined,
		width: responsive ? "100%" : (width ?? "auto"),
		minHeight: height ?? undefined,
		backgroundImage: `url(${resolvedPath})`,
		backgroundSize: objectFit,
		backgroundRepeat: "no-repeat",
		backgroundPosition: "center",
		objectFit,
		transition: blurDataURL ? "filter 0.3s ease" : undefined,
		filter:
			blurDataURL && !isLoaded && !hasError
				? "blur(12px) brightness(1.05)"
				: "none",
		...style,
	};

	// If there's blur placeholder, render as a wrapper with background
	if (blurDataURL) {
		return (
			<div
				style={{
					...wrapperStyle,
					backgroundImage: `url(${blurDataURL})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<picture
					ref={pictureRef}
					data-path={resolvedPath}
					data-loading={resolvedLoading}
					data-decoding={priority ? "sync" : "async"}
					aria-label={alt}
					title={title}
					className={className}
					style={pictureStyle}
					onLoad={handleLoad}
					onError={handleError}
					{...rest}
				/>
			</div>
		);
	}

	return (
		<picture
			ref={pictureRef}
			data-path={hasError ? path : path}
			data-loading={resolvedLoading}
			data-decoding={priority ? "sync" : "async"}
			aria-label={alt}
			title={title}
			className={className}
			style={pictureStyle}
			onLoad={handleLoad}
			onError={handleError}
			{...rest}
		/>
	);
}

export default Picture;
