// Store categorized versions
let categorizedYarn = {};
let categorizedApi = {};
let allLoaderVersions = [];

// Yarn versions cache
const YARN_VERSIONS = {
    '26.1': '26.1+build.1-v2',
    '1.21.11': '1.21.11+build.1-v2',
    '1.21.10': '1.21.10+build.1-v2',
    '1.21.9': '1.21.9+build.1-v2',
    '1.21.8': '1.21.8+build.1-v2',
    '1.21.7': '1.21.7+build.1-v2',
    '1.21.6': '1.21.6+build.1-v2',
    '1.21.5': '1.21.5+build.1-v2',
    '1.21.4': '1.21.4+build.1-v2',
    '1.21.3': '1.21.3+build.1-v2',
    '1.21.2': '1.21.2+build.1-v2',
    '1.21.1': '1.21.1+build.3-v2',
    '1.21': '1.21+build.1-v2',
    '1.20.4': '1.20.4+build.8-v2',

    '1.20.2': '1.20.2+build.4-v2',
    '1.20.1': '1.20.1+build.1-v2',
    '1.19.4': '1.19.4+build.8-v2',
    '1.19.3': '1.19.3+build.4-v2',
    '1.18.2': '1.18.2+build.4-v2',
    '1.17.1': '1.17.1+build.4-v2',
    '1.16.5': '1.16.5+build.6-v2',
    '1.15.2': '1.15.2+build.2-v2',
    '1.14.4': '1.14.4+build.3-v2'
};

const MOJANG_VERSIONS = {
    '26.1': '26.1+stable',
    '1.21.11': '1.21.11+stable',
    '1.21.10': '1.21.10+stable',
    '1.21.9': '1.21.9+stable',
    '1.21.8': '1.21.8+stable',
    '1.21.7': '1.21.7+stable',
    '1.21.6': '1.21.6+stable',
    '1.21.5': '1.21.5+stable',
    '1.21.4': '1.21.4+stable',
    '1.21.3': '1.21.3+stable',
    '1.21.2': '1.21.2+stable',
    '1.21.1': '1.21.1+stable',
    '1.21': '1.21+stable',
    '1.20.4': '1.20.4+stable',

    '1.20.2': '1.20.2+stable',
    '1.20.1': '1.20.1+stable',
    '1.19.4': '1.19.4+stable',
    '1.19.3': '1.19.3+stable',
    '1.18.2': '1.18.2+stable',
    '1.17.1': '1.17.1+stable',
    '1.16.5': '1.16.5+stable',
    '1.15.2': '1.15.2+stable',
    '1.14.4': '1.14.4+stable'
};

// Categorize Yarn versions by Minecraft version (exact match: 1.20.4 -> 1.20.4)
function categorizeYarnVersions(versions) {
    const categorized = {};

    versions.forEach(function(v) {
        const match = v.match(/^(\d+\.\d+\.\d+)/);
        if (match) {
            const mcVersion = match[1];
            if (!categorized[mcVersion]) {
                categorized[mcVersion] = [];
            }
            categorized[mcVersion].push(v);
        }
    });

    for (const mc in categorized) {
        categorized[mc].sort(function(a, b) {
            const buildA = parseInt(a.match(/build\.(\d+)/)?.[1] || 0);
            const buildB = parseInt(b.match(/build\.(\d+)/)?.[1] || 0);
            return buildB - buildA;
        });
    }

    return categorized;
}

// Categorize API versions by Minecraft version (exact match)
function categorizeApiVersions(versions) {
    const categorized = {};

    versions.forEach(function(v) {
        const match = v.match(/\+(\d+\.\d+\.\d+)/);
        if (match) {
            const mcVersion = match[1];
            if (!categorized[mcVersion]) {
                categorized[mcVersion] = [];
            }
            categorized[mcVersion].push(v);
        }
    });

    for (const mc in categorized) {
        categorized[mc].sort(function(a, b) {
            const numA = parseInt(a.split('+')[0].replace(/\./g, '')) || 0;
            const numB = parseInt(b.split('+')[0].replace(/\./g, '')) || 0;
            return numB - numA;
        });
    }

    return categorized;
}

// Update Yarn select options
function updateYarnSelect(versions) {
    const yarnSelect = document.getElementById('yarnVersion');
    yarnSelect.innerHTML = '';

    if (versions.length === 0) {
        yarnSelect.innerHTML = '<option value="">无匹配版本</option>';
        return;
    }

    versions.forEach(function(v) {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v;
        yarnSelect.appendChild(option);
    });
}

// Update API select options
function updateApiSelect(versions) {
    const apiSelect = document.getElementById('apiVersion');
    apiSelect.innerHTML = '';

    if (versions.length === 0) {
        apiSelect.innerHTML = '<option value="">无匹配版本</option>';
        return;
    }

    versions.forEach(function(v) {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v;
        apiSelect.appendChild(option);
    });
}

// Update Loader select with all versions
function updateLoaderSelect(versions, latestVersion) {
    const loaderSelect = document.getElementById('loaderVersion');
    loaderSelect.innerHTML = '';

    // Sort versions (newest first)
    versions.sort(function(a, b) {
        const partsA = a.split('.').map(Number);
        const partsB = b.split('.').map(Number);
        for (let i = 0; i < partsA.length; i++) {
            if (partsB[i] === undefined) return -1;
            if (partsA[i] > partsB[i]) return -1;
            if (partsA[i] < partsB[i]) return 1;
        }
        return 1;
    });

    versions.forEach(function(v) {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v + (v === latestVersion ? ' (最新)' : '');
        if (v === latestVersion) {
            option.selected = true;
        }
        loaderSelect.appendChild(option);
    });
}

// Handle mapping type change
function handleMappingTypeChange() {
    const mappingType = document.getElementById('mappingType').value;
    const yarnSelect = document.getElementById('yarnVersion');

    if (mappingType === 'mojang') {
        yarnSelect.disabled = true;
        yarnSelect.innerHTML = '<option value="">Mojang映射无需Yarn版本</option>';
    } else {
        yarnSelect.disabled = false;
        const mcVersion = document.getElementById('minecraftVersion').value;
        updateYarnSelect(categorizedYarn[mcVersion] || []);
    }
}

// Fetch all versions and categorize them
async function fetchAllVersions() {
    let mcVersion;
    try {
        // Fetch Yarn versions
        const yarnResponse = await fetch('https://maven.fabricmc.net/net/fabricmc/yarn/maven-metadata.xml');
        const yarnText = await yarnResponse.text();
        const yarnVersions = [];
        let match;
        const yarnRegex = /<version>([^<]+)<\/version>/g;
        while ((match = yarnRegex.exec(yarnText))) {
            yarnVersions.push(match[1]);
        }
        categorizedYarn = categorizeYarnVersions(yarnVersions);

        // Fetch API versions
        const apiResponse = await fetch('https://maven.fabricmc.net/net/fabricmc/fabric-api/fabric-api/maven-metadata.xml');
        const apiText = await apiResponse.text();
        const apiVersions = [];
        const apiRegex = /<version>([^<]+)<\/version>/g;
        while ((match = apiRegex.exec(apiText))) {
            apiVersions.push(match[1]);
        }
        categorizedApi = categorizeApiVersions(apiVersions);

        // Fetch ALL Loader versions
        const loaderResponse = await fetch('https://maven.fabricmc.net/net/fabricmc/fabric-loader/maven-metadata.xml');
        const loaderText = await loaderResponse.text();
        const loaderVersions = [];
        const loaderRegex = /<version>([^<]+)<\/version>/g;
        while ((match = loaderRegex.exec(loaderText))) {
            loaderVersions.push(match[1]);
        }
        allLoaderVersions = loaderVersions;

        const latestLoaderMatch = loaderText.match(/<latest>([^<]+)<\/latest>/);
        const latestLoader = latestLoaderMatch ? latestLoaderMatch[1] : '0.15.11';

        // Update Loader select with ALL versions
        updateLoaderSelect(loaderVersions, latestLoader);

        // Get default MC version
        mcVersion = document.getElementById('minecraftVersion').value;

        // Update Yarn and API selects with exact match
        updateYarnSelect(categorizedYarn[mcVersion] || []);
        updateApiSelect(categorizedApi[mcVersion] || []);

        // Update display
        const defaultApi = categorizedApi[mcVersion]?.[0] || '0.100.1+1.20.4';
        document.getElementById('defaultVersions').textContent =
            'Minecraft ' + mcVersion + ' | Fabric Loader ' + latestLoader + ' | Fabric API ' + defaultApi;

        return { loader: latestLoader };
    } catch (e) {
        console.error('Failed to fetch versions:', e);
        document.getElementById('defaultVersions').textContent = 'Minecraft 1.20.4 (使用缓存)';

        mcVersion = document.getElementById('minecraftVersion').value;
        updateYarnSelect([YARN_VERSIONS[mcVersion] || '1.20.4+build.8-v2']);
        updateApiSelect(['0.100.1+1.20.4']);
        updateLoaderSelect(['0.15.11', '0.15.10', '0.15.9'], '0.15.11');

        return { loader: '0.15.11' };
    }
}

// Initialize on page load
const latestVersions = fetchAllVersions();

// When Minecraft version changes, update Yarn and API versions
document.getElementById('minecraftVersion').addEventListener('change', function() {
    const mcVersion = this.value;
    const mappingType = document.getElementById('mappingType').value;

    if (mappingType === 'yarn') {
        updateYarnSelect(categorizedYarn[mcVersion] || [YARN_VERSIONS[mcVersion]]);
    }
    updateApiSelect(categorizedApi[mcVersion] || ['0.100.1+' + mcVersion]);
});

// When mapping type changes, handle Yarn select enable/disable
document.getElementById('mappingType').addEventListener('change', handleMappingTypeChange);

function showStatus(msg, isError) {
    isError = isError || false;
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = isError ? 'error' : 'success';
    el.style.display = 'block';
}

function sanitizePackageName(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9.]/g, '_')
        .replace(/__+/g, '_')
        .replace(/^\.|\.$/g, '') || 'com.example.mod';
}

async function generateTemplate() {
    const btn = document.getElementById('generateBtn');
    const modName = document.getElementById('modName').value.trim() || 'MyMod';
    const modId = document.getElementById('modId').value.trim() || 'mymod';
    const author = document.getElementById('author').value.trim() || 'YourName';
    const packageName = sanitizePackageName(document.getElementById('packageName').value.trim()) || 'com.example.mymod';
    const description = document.getElementById('description').value.trim() || 'A Fabric mod';
    const mcVersion = document.getElementById('minecraftVersion').value;
    const loaderVersion = document.getElementById('loaderVersion').value;
    const yarnVersion = document.getElementById('yarnVersion').value;
    const apiVersion = document.getElementById('apiVersion').value;
    const mappingType = document.getElementById('mappingType').value;
    const enableDataGen = document.getElementById('enableDataGen').checked;
    const separateClientServer = document.getElementById('separateClientServer').checked;

    // Use selected mapping version
    const mappings = mappingType === 'yarn' ? (yarnVersion || YARN_VERSIONS[mcVersion]) : MOJANG_VERSIONS[mcVersion];
    const mappingsRepo = mappingType === 'yarn' ? 'net.fabricmc:yarn' : 'net.fabricmc:mojang';

    // Use selected API version
    const fabricApi = apiVersion || '0.100.1+' + mcVersion;
    const packagePath = packageName.replace(/\./g, '/');

    btn.disabled = true;
    btn.textContent = '生成中...';

    try {
        var zip = new JSZip();

        // Gradle Wrapper
        zip.file('gradlew', '#!/bin/sh\njava -jar "$0/../gradle/wrapper/gradle-wrapper.jar" "$@"');
        zip.file('gradlew.bat', '@echo off\njava -jar "%~dp0gradle\\wrapper\\gradle-wrapper.jar" %*');
        zip.file('gradle/wrapper/gradle-wrapper.properties',
            'distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-9.3.0-bin.zip\nnetworkTimeout=10000\nvalidateDistributionUrl=true\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists');

        // build.gradle
        let dataGenConfig = '';
        if (enableDataGen) {
            dataGenConfig = '\n\nloom {\n    generateSources = true\n}\n\ntasks.withType(JavaSourceSet).configureEach {\n    source srcGenerated.main\n}';
        }

        let runConfig;
        if (separateClientServer) {
            runConfig = '\nminecraft {\n    runs {\n        client {\n            workingDirectory = file("run")\n            property "mixin.env.remapRefMap", "true"\n            modSource sourceSets.main\n        }\n        server {\n            workingDirectory = file("run")\n            property "mixin.env.remapRefMap", "true"\n            modSource sourceSets.main\n        }\n    }\n}';
        } else {
            runConfig = '\nminecraft {\n    runs {\n        client { workingDirectory = file(\'run\') }\n        server { workingDirectory = file(\'run\') }\n    }\n}';
        }

        zip.file('build.gradle', 'plugins {\n    id \'fabric-loom\' version \'' + loaderVersion + '\'\n    id \'maven-publish\'\n}\n\nversion = \'1.0.0\'\ngroup = \'' + packageName + '\'\narchivesBaseName = \'' + modId + '\'\n\njava {\n    sourceCompatibility = JavaVersion.VERSION_17\n    targetCompatibility = JavaVersion.VERSION_17\n}' + runConfig + '\n\ndependencies {\n    minecraft "com.mojang:minecraft:' + mcVersion + '"\n    mappings "' + mappingsRepo + ':' + mappings + ':v2"\n    modImplementation "net.fabricmc:fabric-loader:' + loaderVersion + '"\n    modImplementation "net.fabricmc.fabric-api:fabric-api:' + fabricApi + '"\n}' + dataGenConfig + '\n\nprocessResources {\n    inputs.property "version", project.version\n    filesMatching("fabric.mod.json") {\n        expand "version": project.version\n    }\n}\n\ntasks.withType(JavaCompile).configureEach {\n    options.encoding = "UTF-8"\n}\n\npublishing {\n    publications {\n        mavenJava(MavenPublication) {\n            artifact jar\n        }\n    }\n}\n');

        // settings.gradle
        zip.file('settings.gradle', 'pluginManagement {\n    repositories {\n        maven { name = \'Fabric\'; url = \'https://maven.fabricmc.net/\' }\n        maven { name = \'Fabric Modules\'; url = \'https://maven.fabricmc.net/modules/\' }\n        gradlePluginPortal()\n    }\n}\n\nplugins {\n    id \'org.gradle.toolchains.foojay-resolver-convention\' version \'0.5.0\'\n}\n\nrootProject.name = \'' + modName + '\'\n');

        // gradle.properties
        zip.file('gradle.properties', 'org.gradle.jvmargs=-Xmx4G\norg.gradle.parallel=true\norg.gradle.caching=true\n\nminecraft_version=' + mcVersion + '\nyarn_mappings=' + mappings + '\nloader_version=' + loaderVersion + '\nmod_version=1.0.0\nmaven_group=' + packageName + '\narchives_base_name=' + modId + '\nfabric_api_version=' + fabricApi + '\n');

        // fabric.mod.json
        const fabricModJson = {
            schemaVersion: 1,
            id: modId,
            version: '1.0.0',
            name: modName,
            description: description,
            authors: [author],
            contact: {
                homepage: 'https://fabricmc.net/',
                sources: 'https://github.com/FabricMC/fabric-example-mod'
            },
            license: 'CC0-1.0',
            icon: 'assets/icon.png',
            environment: '*',
            entrypoints: {
                main: [packageName + '.ExampleMod']
            },
            depends: {
                fabricloader: '>=' + loaderVersion,
                minecraft: mcVersion,
                java: '>=17'
            }
        };

        if (separateClientServer) {
            fabricModJson.mixins = [modId + '.mixins.json'];
            fabricModJson.client = [packageName + '.mixin.ClientModMixin'];
        }

        zip.file('src/main/resources/fabric.mod.json', JSON.stringify(fabricModJson, null, 2));

        // Main Mod Class
        zip.file('src/main/java/' + packagePath + '/ExampleMod.java', 'package ' + packageName + ';\n\nimport net.fabricmc.api.ModInitializer;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\n\npublic class ExampleMod implements ModInitializer {\n    public static final Logger LOGGER = LoggerFactory.getLogger("' + modId + '");\n\n    @Override\n    public void onInitialize() {\n        LOGGER.info("' + modName + ' has initialized!");\n    }\n}\n');

        // Mixin config
        if (separateClientServer) {
            const mixinClassName = 'ClientModMixin';
            zip.file('src/main/java/' + packagePath + '/mixin/' + mixinClassName + '.java', 'package ' + packageName + '.mixin;\n\nimport net.fabricmc.api.Environment;\nimport net.fabricmc.api.EnvType;\nimport org.spongepowered.asm.mixin.Mixin;\nimport org.spongepowered.asm.mixin.injection.At;\nimport org.spongepowered.asm.mixin.injection.Inject;\n\n@Mixin(targets = "net.minecraft.client.MinecraftClient")\npublic class ' + mixinClassName + ' {\n    \n    @Inject(method = "run", at = @At("HEAD"))\n    private void onRun(CallbackInfo ci) {\n        System.out.println("' + modName + ' - Client side initialization");\n    }\n}\n');

            zip.file('src/main/resources/' + modId + '.mixins.json', JSON.stringify({
                required: true,
                minVersion: "0.8",
                package: packageName + '.mixin',
                compatibilityLevel: "JAVA_17",
                mixins: [],
                client: [packageName + '.mixin.' + mixinClassName],
                injectors: {
                    defaultRequire: 1
                }
            }, null, 2));
        }

        // Access Widener
        zip.file('src/main/resources/' + modId + '.accesswidener', 'accesswidener ' + packagePath + '/ExampleMod wide\n');

        // .gitignore
        zip.file('.gitignore', '.gradle/\nbuild/\n!gradle-wrapper.jar\n!gradle-wrapper.properties\n\n.idea/\n*.iml\n.vscode/\n\n.DS_Store\nThumbs.db\n\n*.log\n\nrun/\n');

        // README
        zip.file('README.md', '# ' + modName + '\n\n' + description + '\n\n## 信息\n- **Minecraft**: ' + mcVersion + '\n- **Loader**: ' + loaderVersion + '\n- **Mappings**: ' + (mappingType === 'yarn' ? 'Yarn' : 'Mojang') + '\n- **Package**: ' + packageName + '\n\n## 构建\n```bash\n./gradlew build\n```\n\n## 运行\n```bash\n./gradlew runClient\n./gradlew runServer\n```\n');

        // Generate and download
        const blob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {level: 9}
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = modId + '-' + mcVersion + '.zip';
        a.click();
        URL.revokeObjectURL(url);

        showStatus('模板生成成功！(' + modId + '-' + mcVersion + '.zip)');
    } catch (e) {
        showStatus('生成失败: ' + e.message, true);
        console.error(e);
    }

    btn.disabled = false;
    btn.textContent = '生成模板';
}
