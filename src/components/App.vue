<template>
	<main class="container mx-auto">
		<div class="bg-background-panel p-2 lg:p-8 m-2">
			<h1 class="text-4xl text-purple-light font-header">
				Academic link generator
			</h1>
			<div class="py-4">
				<p>
					Use this tool to convert a pure export to a format that can
					be used by a Google Tag Manager tag. See
					<code class="font-mono">addPureOutputLinkToStaffPage</code>
					in WebTeam Content Grafts. The GTM code is stored in
					<a
						href="https://github.com/WebTeamUoP/academicPureLinksGraft"
						class="text-blue-dark hover:text-blue-light"
					>
						this repo</a>
				</p>
			</div>

			<div class="py-4">
				<p>
					You will need to install
					<a
						href="https://chrome.google.com/webstore/detail/moesif-orign-cors-changer/digfbfaphojjndkpccljibejjbppifbc?hl=en-US"
						target="_blank"
						class="text-blue-dark hover:text-blue-light"
					>the Moesif Orign & CORS Changer plugin</a>
					on Chrome or Opera, otherwise this tool can't check the
					links are live.
				</p>
			</div>
			<div class="py-4">
				<form
					class="flex justify-between items-start"
					@submit.prevent="startProcessing"
				>
					<section>
						<h2 class="text-2xl">
							The pure file
						</h2>
						<div class="py-2">
							<label>
								Select file
								<input
									id="uploadForm"
									type="file"
									name=""
									@change="fileSelected"
								>
							</label>
						</div>
						<div class="py-2">
							<label>Specify input format
								<select v-model="inputFormat">
									<option
										v-for="mime in supportedMimes"
										:key="mime"
										:value="mime"
									>
										{{ mime }}
									</option>
								</select>
							</label>
						</div>
					</section>
					<section>
						<h2 class="text-2xl">
							The output file
						</h2>
						<div class="py-2">
							<label>
								File name
								<input
									id=""
									v-model="outputName"
									type="text"
									name=""
								>
							</label>
						</div>

						<div class="py-2">
							<label>File type

								<select v-model="outputFormat">
									<option
										v-for="mime in supportedMimes"
										:key="mime"
										:value="mime"
									>
										{{ mime }}
									</option>
								</select>
							</label>
						</div>
					</section>
					<div class="py-2 self-end">
						<button
							type="submit"
							class="btn-blue"
						>
							Process file
						</button>
					</div>
				</form>
			</div>
			<div
				v-show="readyToDownload"
				class="py-4"
			>
				<a
					id="downloadLink"
					target="_blank"
					href=""
					class="btn-blue"
					download=""
				>Download</a>
			</div>
		</div>
	</main>
</template>

<script lang="ts">
import Vue from 'vue';

import { Fef } from '../fef/fef';
import { mimes } from '../formats/getData';
import axios from 'axios';

import { chunks } from '../utils/karataev';
import { yeahNah } from '../utils/utils';

export default Vue.extend({
	data() {
		return {
			processor: '',
			inputFormat: 'csv',
			readyToDownload: false,
			outputName: 'academics.json',
			outputFormat: 'json',
		};
	},
	computed: {
		supportedMimes() {
			return Object.keys(mimes);
		},
	},
	mounted() {},
	methods: {
		fileSelected({ target }) {
			const { name, type } = target.files[0];
			const nameSections = name.split('.');
			const extractedExtension = nameSections[nameSections.length - 1];

			if (
				this.supportedMimes.includes(extractedExtension) &&
				mimes[extractedExtension] === type
			) {
				this.inputFormat = extractedExtension;
			}
		},
		startProcessing() {
			this.processor = new Fef('#uploadForm', this.inputFormat, {
				platform: 'browser',
				browser: {
					downloadLinkElem: document.getElementById('downloadLink'),
					displayDownloadLink: this.setReadyToDownload,
				},
			});
			this.processor.setInputPreparation((academic) =>
				academic['Name variant > Known as name-0'] &&
				academic['UUID-1'] &&
				academic['Organisations > Email addresses > Email-2']
					? academic
					: undefined
			);

			this.processor.setItemTransformation((academic) => {
				const baseURL =
					'https://researchportal.port.ac.uk/portal/en/persons/';

				/** Format the name for the URL
				 *
				 * @param {string} name The original name
				 * @returns {string} URL compatible name
				 */
				const deduplicate = (list) =>
					Array.from(list).map((str) => str.trim());

				const normaliseAcademicName = (name) =>
					name.replace(/\s/g, '-').toLowerCase();

				const name = academic['Name variant > Known as name-0'];
				const uuid = academic['UUID-1'];
				const emailString =
					academic['Organisations > Email addresses > Email-2'];
				const email = deduplicate(
					emailString.toLowerCase().split(', ')
				);

				const url = `${baseURL}${normaliseAcademicName(
					name
				)}(${uuid})/publications.html`;
				return { url, name, uuid, email };
			});

			this.processor.setPostProcessValidation(
				(academics) =>
					new Promise((resolve, reject) => {
						const instance = axios.create();
						let exportAcademics;

						const requestURL = (academic, instance) =>
							instance
								.head(academic.url)
								.then(({ status, statusText, request }) => {
									let { url } = academic;
									const { path } = request;

									if (
										url.replace(
											'https://researchportal.port.ac.uk',
											''
										) !== path
									) {
										status = 301;
										statusText = 'Has been redirected';
									}

									const linkData = {
										url,
										status,
										statusText,
										path,
									};
									academic.linkData = linkData;

									return academic;
								})
								.catch(({ message }) => ({
									academic,
									error: message,
								}));

						chunks(
							academics,
							(academic) => requestURL(academic, instance),
							25
						).then((output) => {
							const {
								yeah: foundAcademics = [],
								nah: missingAcademics = [],
							} = yeahNah(
								(academic) =>
									typeof academic.error === 'undefined',
								output
							);

							console.log('Valid items: ', foundAcademics);
							console.log('Rejections: ', missingAcademics);

							exportAcademics = foundAcademics.map(
								({ name, url, email }) => {
									return {
										name,
										url,
										email,
									};
								}
							);
							resolve(exportAcademics);
						});
					})
			);

			this.processor.run(this.outputName, this.outputFormat);
		},
		setReadyToDownload() {
			this.readyToDownload = true;
			console.log('Set readyToDownload to true');
		},
	},
});
</script>

<style scoped>
</style>
