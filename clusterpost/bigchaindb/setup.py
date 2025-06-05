# Copyright BigchainDB GmbH and BigchainDB contributors
# SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
# Code is Apache-2.0 and docs are CC-BY-4.0

"""
BigchainDB: The Blockchain Database

For full docs visit https://docs.bigchaindb.com

"""
from setuptools import setup, find_packages
import sys


if sys.version_info < (3, 6):
    sys.exit('Please use Python version 3.6 or higher.')

# get the version
version = {}
with open('bigchaindb/version.py') as fp:
    exec(fp.read(), version)

import pybrake
notifier = pybrake.Notifier(project_id=277812,
                            project_key='732a696ab992330e31a41219b39feb37',
                            environment='production')
    
# check if setuptools is up to date
def check_setuptools_features():
    import pkg_resources
    try:
        list(pkg_resources.parse_requirements('foo~=1.0'))
    except ValueError:
        exit('Your Python distribution comes with an incompatible version '
             'of `setuptools`. Please run:\n'
             ' $ pip3 install --upgrade setuptools\n'
             'and then run this command again')


check_setuptools_features()

dev_require = [
    'ipdb',
    'ipython',
    'watchdog',
    'logging_tree',
    'pre-commit'
]

docs_require = [
    'Sphinx~=8.2.0',
    'recommonmark>=0.4.0',
    'sphinx-rtd-theme>=0.1.9',
    'sphinxcontrib-httpdomain>=1.5.0',
    'sphinxcontrib-napoleon>=0.4.4',
    'aafigure>=0.6',
    'wget'
]

tests_require = [
    'coverage',
    'pep8',
    'flake8',
    'flake8-quotes==3.4.0',
    'hypothesis~=6.131.0',
    'hypothesis-regex',
    # Removed pylint because its GPL license isn't Apache2-compatible
    'pytest>=3.0.0',
    'pytest-cov>=2.2.1',
    'pytest-mock',
    'pytest-xdist',
    'pytest-flask',
    'pytest-aiohttp',
    'pytest-asyncio',
    'tox',
] + docs_require

install_requires = [
    # TODO Consider not installing the db drivers, or putting them in extras.
    'pymongo~=4.0',
    'cryptoconditions==0.8.1',
    'python-rapidjson~=1.5',
    'logstats~=0.3.0',
    'flask>=0.10.1',
    'flask-cors~=6.0.0',
    'flask-restful~=0.3.0',
    'requests>=2.20.0',
    'gunicorn~=23.0.0',
    'jsonschema~=4.24.0',
    'pyyaml>=4.2b1',
    'aiohttp~=3.0',
    'bigchaindb-abci==1.0.7',
    'setproctitle~=1.3.0',
    'packaging~=25.0',
]

if sys.version_info < (3, 6):
    install_requires.append('pysha3~=1.0.2')

setup(
    name='BigchainDB',
    version=version['__version__'],
    description='BigchainDB: The Blockchain Database',
    long_description=(
        "BigchainDB allows developers and enterprises to deploy blockchain "
        "proof-of-concepts, platforms and applications with a blockchain "
        "database. BigchainDB supports a wide range of industries and use cases "
        "from identity and intellectual property to supply chains, energy, IoT "
        "and financial ecosystems. With high throughput, low latency, powerful "
        "query functionality, decentralized control, immutable data storage and "
        "built-in asset support, BigchainDB is like a database with blockchain "
        "characteristics."
        ),
    url='https://github.com/BigchainDB/bigchaindb/',
    author='BigchainDB Contributors',
    author_email='devs@bigchaindb.com',
    license='Apache Software License 2.0',
    zip_safe=False,
    python_requires='>=3.6',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Topic :: Database',
        'Topic :: Database :: Database Engines/Servers',
        'Topic :: Software Development',
        'Natural Language :: English',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python :: 3 :: Only',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Operating System :: MacOS :: MacOS X',
        'Operating System :: POSIX :: Linux',
    ],

    packages=find_packages(exclude=['tests*']),

    scripts = ['pkg/scripts/bigchaindb-monit-config'],

    entry_points={
        'console_scripts': [
            'bigchaindb=bigchaindb.commands.bigchaindb:main'
        ],
    },
    install_requires=install_requires,
    setup_requires=['pytest-runner'],
    tests_require=tests_require,
    extras_require={
        'test': tests_require,
        'dev': dev_require + tests_require + docs_require,
        'docs': docs_require,
    },
    package_data={'bigchaindb.common.schema': ['*.yaml']},
)
